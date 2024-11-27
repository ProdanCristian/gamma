import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
  try {
    const rawText = await req.text();
    console.log('Raw webhook data:', rawText);
    
    // Parse URL-encoded data
    const params = new URLSearchParams(rawText);
    const data = {};
    
    // Convert URL-encoded data to nested object structure
    for (const [key, value] of params.entries()) {
      const keys = key.replace(/\]/g, '').split('[');
      let current = data;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        current = current[k];
      }
      
      const lastKey = keys[keys.length - 1];
      if (Array.isArray(current)) {
        current[parseInt(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }
    }

    console.log('Parsed data:', JSON.stringify(data, null, 2));

    const leads = data?.leads?.status;
    
    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook data format" },
        { status: 400 }
      );
    }

    for (const lead of leads) {
      const statusId = lead.status_id;
      const orderNumbers = lead.custom_fields.find(
        (field) => field.name === "Numarul comenzii"
      )?.values[0]?.value;

      const productsList = lead.custom_fields.find(
        (field) => field.name === "Lista Produse"
      )?.values[0]?.value;

      if (!orderNumbers || !productsList) continue;

      const orderIds = orderNumbers.split(", ");
      const products = productsList.split("\n\n");

      for (let i = 0; i < orderIds.length; i++) {
        const orderId = orderIds[i];

        // Get current order details
        const currentOrder = await db.query(
          `SELECT "Cantitate", "nc_pka4__Produse_id", "Status" 
             FROM "nc_pka4___Comenzi" 
             WHERE "id" = $1`,
          [orderId]
        );

        if (!currentOrder.rows.length) continue;

        const currentOrderData = currentOrder.rows[0];

        // Extract quantity from webhook product string
        const quantityMatch = products[i].match(/Cantitate: (\d+)/);
        const newQuantity = quantityMatch ? parseInt(quantityMatch[1]) : null;

        let newStatus;
        let shouldUpdateStock = false;
        let quantityDifference = 0;

        if (
          products[i] &&
          (products[i].startsWith("X ") ||
            products[i].startsWith("x ") ||
            /^\[[\s]*[xX][\s]*\]/.test(products[i]))
        ) {
          newStatus = "Anulata";
          const orderQuantity = parseInt(currentOrderData.Cantitate) || 0;
          await db.query(
            `UPDATE "nc_pka4__Produse" 
               SET "Stock" = "Stock" + $1 
               WHERE "id" = $2`,
            [orderQuantity, currentOrderData.nc_pka4__Produse_id]
          );
        } else {
          switch (statusId) {
            case "143":
              newStatus = "Anulata";
              const cancelledQuantity = parseInt(currentOrderData.Cantitate) || 0;
              await db.query(
                `UPDATE "nc_pka4__Produse" 
                   SET "Stock" = "Stock" + $1 
                   WHERE "id" = $2`,
                [cancelledQuantity, currentOrderData.nc_pka4__Produse_id]
              );
              break;
            case "71841698":
              newStatus = "Retur";
              const returnedQuantity = parseInt(currentOrderData.Cantitate) || 0;
              await db.query(
                `UPDATE "nc_pka4__Produse" 
                   SET "Stock" = "Stock" + $1 
                   WHERE "id" = $2`,
                [returnedQuantity, currentOrderData.nc_pka4__Produse_id]
              );
              break;
            case "69959066":
              newStatus = "Comanda Confirmata";
              break;
            case "71841686":
              newStatus = "Transmis la Curier";
              break;
            case "71841690":
              newStatus = "Comanda Finalizata";
              break;
            default:
              continue;
          }
        }

        // Handle quantity changes from amoCRM
        if (
          newQuantity !== null &&
          newQuantity !== currentOrderData.Cantitate
        ) {
          quantityDifference = currentOrderData.Cantitate - newQuantity;
          
          // Update order quantity
          await db.query(
            `UPDATE "nc_pka4___Comenzi" 
               SET "Cantitate" = $1 
               WHERE "id" = $2`,
            [newQuantity, orderId]
          );

          // Update product stock for quantity difference
          await db.query(
            `UPDATE "nc_pka4__Produse" 
               SET "Stock" = "Stock" + $1 
               WHERE "id" = $2`,
            [quantityDifference, currentOrderData.nc_pka4__Produse_id]
          );
        }

        // Update order status
        await db.query(
          `UPDATE "nc_pka4___Comenzi" 
             SET "Status" = $1 
             WHERE "id" = $2`,
          [newStatus, orderId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Orders and stock updated successfully",
    });
  } catch (error) {
    console.error("Error processing amoCRM webhook:", error);
    return NextResponse.json(
      { success: false, message: "Error processing webhook data" },
      { status: 500 }
    );
  }
}
