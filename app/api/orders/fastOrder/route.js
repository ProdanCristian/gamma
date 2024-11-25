import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DELIVERY_RULES } from "@/lib/store/useCart";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";

export async function POST(request) {
  let t, checkoutT;

  try {
    const session = await getServerSession(authOptions);
    const {
      userId,
      numePrenume,
      numarTelefon,
      email,
      productId,
      quantity,
      deliveryZone,
      isFreeDelivery,
      locale,
      productPrice,
    } = await request.json();

    // Get translations
    t = await getTranslations({ locale, namespace: "orders" });
    checkoutT = await getTranslations({ locale, namespace: "checkout" });

    await db.query("BEGIN");

    try {
      const productResult = await db.query(
        `SELECT "Nume_Produs_RO", "Nume_Produs_RU", "Pret_Standard", "Pret_Redus", "Imagine_Principala" 
         FROM "nc_pka4__Produse" WHERE "id" = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error("Product not found");
      }

      const subtotal = productPrice * quantity;
      const deliveryPrice = isFreeDelivery
        ? 0
        : DELIVERY_RULES[deliveryZone].cost;
      const total = subtotal + deliveryPrice;

      const chisinauTime = new Date().toLocaleString("en-US", {
        timeZone: "Europe/Chisinau",
      });
      const chisinauDate = new Date(chisinauTime);

      // Get address from Utilizatori table if user is logged in
      let address = null;
      if (userId) {
        const userResult = await db.query(
          `SELECT "Adresa" FROM "nc_pka4___Utilizatori" WHERE "id" = $1`,
          [userId]
        );
        if (userResult.rows.length > 0 && userResult.rows[0].Adresa) {
          address = userResult.rows[0].Adresa;
        }
      }

      // Determine payment method based on locale
      const paymentMethod =
        locale === "ru" ? "Оплата при доставке" : "Plata la livrare";

      const orderResult = await db.query(
        `INSERT INTO "nc_pka4___Comenzi" 
        ("nc_pka4___Utilizatori_id", "Nume_Prenume", "Numar_telefon", "nc_pka4__Produse_id", 
         "Status", "Cantitate", "Pret_Livrare", "Total", "created_at", "Adresa_Livrare", 
         "Metoda_De_Plata", "Pret_Produs", "Email") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING id`,
        [
          userId || null,
          numePrenume,
          parseInt(numarTelefon),
          productId,
          "Solicitare Primita",
          quantity,
          isFreeDelivery
            ? "Gratis"
            : DELIVERY_RULES[deliveryZone].cost.toString(),
          total.toFixed(2),
          chisinauDate,
          address,
          paymentMethod,
          productPrice.toFixed(2),
          email || session?.user?.email || null,
        ]
      );

      await db.query("COMMIT");

      // Send email if we have an email address
      if (email || session?.user?.email) {
        const transporter = nodemailer.createTransport({
          host: "smtp.hostinger.com",
          port: 465,
          secure: true,
          debug: true,
          logger: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const productData = productResult.rows[0];
        const productName =
          locale === "ru"
            ? productData.Nume_Produs_RU
            : productData.Nume_Produs_RO;

        // Process image URL
        let imageUrl = "https://gamma.md/Gamma.png";
        if (productData.Imagine_Principala) {
          try {
            let imagePath = productData.Imagine_Principala;
            if (
              typeof imagePath === "string" &&
              (imagePath.startsWith("{") || imagePath.startsWith("["))
            ) {
              const imageData = JSON.parse(imagePath);
              if (Array.isArray(imageData)) {
                imagePath = imageData[0].path;
              } else if (imageData.path) {
                imagePath = imageData.path;
              }
            }
            if (imagePath) {
              imagePath = imagePath.replace(/[\[\]{}]/g, "").trim();
              imageUrl = imagePath.startsWith("download/")
                ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${imagePath}`
                : `${process.env.NEXT_PUBLIC_MEDIA_URL}/download/${imagePath}`;
            }
          } catch (e) {
            console.error("Error processing image path:", e);
          }
        }

        const hasDiscount =
          productData.Pret_Redus &&
          parseFloat(productData.Pret_Redus) <
            parseFloat(productData.Pret_Standard);

        const mailOptions = {
          from: {
            name: "Gamma",
            address: process.env.EMAIL_USER,
          },
          to: email || session.user.email,
          subject: `Gamma - ${t("order_confirmation")} #${
            orderResult.rows[0].id
          }`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${t("order_confirmation")}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px 0; text-align: center; background-color: #343746;">
                    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
                      <tr>
                        <td style="text-align: center;">
                          <img src="https://gamma.md/Gamma.png" alt="Gamma Logo" style="height: 50px; width: auto; vertical-align: middle;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="padding: 30px;">
                          <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                            ${t("hello")} ${numePrenume}!
                            <br>
                            ${t("order_thank_you")}
                          </h1>
                          
                          <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
                            <table role="presentation" style="width: 100%;">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                  <strong style="color: #495057;">${t(
                                    "order_details"
                                  )}:</strong>
                                </td>
                              </tr>
                              
                              <tr>
                                <td style="padding: 10px 0;">
                                  <strong style="color: #495057;">${t(
                                    "product"
                                  )}:</strong>
                                  <div style="display: flex; align-items: center; margin-top: 10px;">
                                    <img src="${imageUrl}" 
                                         alt="${productName}" 
                                         style="width: 80px; height: 80px; object-fit: contain; margin-right: 15px;">
                                    <div style="color: #212529;">
                                      <strong>${productName}</strong>
                                      <br>
                                      ${t("quantity")}: ${quantity}
                                      <br>
                                      ${t("price")}: ${
            hasDiscount
              ? `<span style="color: #dc2626;">${productData.Pret_Redus} ${t(
                  "currency"
                )}</span> 
                                             <span style="text-decoration: line-through; color: #6b7280; margin-left: 4px;">
                                               ${productData.Pret_Standard} ${t(
                  "currency"
                )}
                                             </span>`
              : `${productData.Pret_Standard} ${t("currency")}`
          }
                                    </div>
                                  </div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0; border-top: 1px solid #dee2e6;">
                                  <strong style="color: #495057;">${t(
                                    "delivery_cost"
                                  )}:</strong>
                                  <div style="margin-top: 5px; color: #212529;">
                                    ${
                                      isFreeDelivery
                                        ? t("free")
                                        : `${deliveryPrice} ${t("currency")}`
                                    }
                                  </div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0; border-top: 1px solid #dee2e6;">
                                  <strong style="color: #495057;">${t(
                                    "total"
                                  )}:</strong>
                                  <div style="margin-top: 5px; color: #212529;">${total.toFixed(
                                    2
                                  )} ${t("currency")}</div>
                                </td>
                              </tr>

                              ${
                                address
                                  ? `
                                <tr>
                                  <td style="padding: 10px 0; border-top: 1px solid #dee2e6;">
                                    <strong style="color: #495057;">${t(
                                      "delivery_address"
                                    )}:</strong>
                                    <div style="margin-top: 5px; color: #212529;">${address}</div>
                                  </td>
                                </tr>
                              `
                                  : ""
                              }

                              <tr>
                                <td style="padding: 10px 0; border-top: 1px solid #dee2e6;">
                                  <strong style="color: #495057;">${t(
                                    "phone"
                                  )}:</strong>
                                  <div style="margin-top: 5px; color: #212529;">${numarTelefon}</div>
                                </td>
                              </tr>
                            </table>
                          </div>

                          <p style="color: #666666; margin-top: 20px; text-align: center;">
                            ${t("order_received")}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 20px; text-align: center; color: #666666; font-size: 12px;">
                    <p style="margin: 0;">© 2024 Gamma</p>
                    <p style="margin: 10px 0 0 0; line-height: 1.4;">
                      Strada Sfîntul Gheorghe 6, Chișinău, Moldova | Tel: 022897007 | Email: info@gamma.md
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(checkoutT("email_sent_success"));
        } catch (emailError) {
          console.error(checkoutT("email_send_error"), emailError);
        }
      }

      return NextResponse.json({
        success: true,
        orderId: orderResult.rows[0].id,
        address: address,
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create order",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
