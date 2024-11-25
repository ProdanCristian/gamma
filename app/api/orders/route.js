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
    const requestData = await request.json();

    const {
      userId,
      numePrenume,
      numarTelefon,
      products: rawProducts,
      deliveryZone,
      isFreeDelivery,
      address,
      couponCode,
      couponDiscount,
      total: cartTotal,
      paymentMethod,
      email,
      locale,
    } = requestData;

    t = await getTranslations({ locale, namespace: "orders" });
    checkoutT = await getTranslations({ locale, namespace: "checkout" });

    const products = Array.isArray(rawProducts)
      ? rawProducts
      : rawProducts
      ? [rawProducts]
      : [];

    if (!products.length) {
      throw new Error(checkoutT("fill_all_fields"));
    }

    await db.query("BEGIN");

    try {
      const chisinauTime = new Date().toLocaleString("en-US", {
        timeZone: "Europe/Chisinau",
      });
      const chisinauDate = new Date(chisinauTime);
      const deliveryPrice = isFreeDelivery
        ? 0
        : DELIVERY_RULES[deliveryZone].cost;

      const orderIds = [];
      let totalOrderAmount = 0;

      for (const product of products) {
        const productResult = await db.query(
          `SELECT "Pret_Standard", "Pret_Redus" FROM "nc_pka4__Produse" WHERE "id" = $1`,
          [product.id]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${product.id} not found`);
        }

        const dbProduct = productResult.rows[0];
        const basePrice =
          dbProduct.Pret_Redus &&
          parseFloat(dbProduct.Pret_Redus) < parseFloat(dbProduct.Pret_Standard)
            ? parseFloat(dbProduct.Pret_Redus)
            : parseFloat(dbProduct.Pret_Standard);

        const finalProductPrice = basePrice * (1 - couponDiscount / 100);

        const couponInfo = couponCode
          ? `${couponCode} (-${couponDiscount}%)`
          : null;

        const subtotal = finalProductPrice * product.quantity;
        const orderTotal = subtotal + (isFreeDelivery ? 0 : deliveryPrice);
        totalOrderAmount += orderTotal;

        const orderResult = await db.query(
          `INSERT INTO "nc_pka4___Comenzi" 
          ("nc_pka4___Utilizatori_id", "Nume_Prenume", "Numar_telefon", 
           "nc_pka4__Produse_id", "Status", "Cantitate", "Pret_Livrare", 
           "Total", "created_at", "Adresa_Livrare", "Cupon_Aplicat", "Pret_Produs", "Metoda_De_Plata", "Email") 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
          RETURNING id`,
          [
            userId || null,
            numePrenume,
            numarTelefon,
            product.id,
            "Solicitare Primita",
            product.quantity,
            isFreeDelivery ? "Gratis" : deliveryPrice.toString(),
            cartTotal.toFixed(2),
            chisinauDate,
            address,
            couponInfo,
            finalProductPrice.toFixed(2),
            paymentMethod,
            email,
          ]
        );

        orderIds.push(orderResult.rows[0].id);
      }

      await db.query("COMMIT");

      // Create email transporter
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

      // Verify SMTP connection
      try {
        await transporter.verify();
        console.log(checkoutT("email_verification_success"));
      } catch (verifyError) {
        console.error(checkoutT("email_verification_error"), verifyError);
        // Don't throw error, continue with order processing
      }

      // Format products for email
      const productsHtml = await Promise.all(
        products.map(async (product) => {
          const productResult = await db.query(
            `SELECT "Nume_Produs_RO", "Nume_Produs_RU", "Pret_Standard", "Pret_Redus", "Imagine_Principala" 
             FROM "nc_pka4__Produse" WHERE "id" = $1`,
            [product.id]
          );

          const productData = productResult.rows[0];
          const productName =
            locale === "ru"
              ? productData.Nume_Produs_RU
              : productData.Nume_Produs_RO;

          const hasDiscount =
            productData.Pret_Redus &&
            parseFloat(productData.Pret_Redus) <
              parseFloat(productData.Pret_Standard);

          const price = hasDiscount
            ? productData.Pret_Redus
            : productData.Pret_Standard;

          // Process image URL - Improved parsing
          let imageUrl = "https://gamma.md/Gamma.png"; // default fallback

          if (productData.Imagine_Principala) {
            try {
              let imagePath = productData.Imagine_Principala;

              // If it's a JSON string, parse it
              if (
                typeof imagePath === "string" &&
                (imagePath.startsWith("{") || imagePath.startsWith("["))
              ) {
                const imageData = JSON.parse(imagePath);
                // Check if it's an array and take the first item
                if (Array.isArray(imageData)) {
                  imagePath = imageData[0].path;
                }
                // If it's an object, take the path property
                else if (imageData.path) {
                  imagePath = imageData.path;
                }
              }

              // Clean up the path and construct the URL
              if (imagePath) {
                // Remove any remaining brackets and clean the path
                imagePath = imagePath.replace(/[\[\]{}]/g, "").trim();

                // If path starts with 'download/', don't add it again
                if (imagePath.startsWith("download/")) {
                  imageUrl = `${process.env.NEXT_PUBLIC_MEDIA_URL}/${imagePath}`;
                } else {
                  imageUrl = `${process.env.NEXT_PUBLIC_MEDIA_URL}/download/${imagePath}`;
                }
              }
            } catch (e) {
              console.error("Error processing image path:", e);
              // Keep the fallback image in case of error
            }
          }

          return `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
              <div style="display: flex; align-items: center;">
                <img src="${imageUrl}" 
                     alt="${productName}" 
                     style="width: 80px; height: 80px; object-fit: contain; margin-right: 15px;">
                <div style="color: #212529;">
                  <strong>${productName}</strong>
                  <br>
                  ${t("quantity")}: ${product.quantity}
                  <br>
                  ${t("price")}: ${
            hasDiscount
              ? `<span style="color: #dc2626;">${price} ${t("currency")}</span> 
                         <span style="text-decoration: line-through; color: #6b7280; margin-left: 4px;">
                           ${productData.Pret_Standard} ${t("currency")}
                         </span>`
              : `${price} ${t("currency")}`
          }
                </div>
              </div>
            </td>
          </tr>
        `;
        })
      );

      const mailOptions = {
        from: {
          name: "Gamma",
          address: process.env.EMAIL_USER,
        },
        to: email,
        subject: `Gamma - ${t("order_confirmation")} #${orderIds.join(", ")}`,
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
                                <table role="presentation" style="width: 100%; margin-top: 10px;">
                                  ${productsHtml.join("")}
                                </table>
                              </td>
                            </tr>

                            ${
                              couponDiscount > 0
                                ? `
                              <tr>
                                <td style="padding: 10px 0; border-top: 1px solid #dee2e6;">
                                  <strong style="color: #495057;">${t(
                                    "coupon"
                                  )}:</strong>
                                  <div style="margin-top: 5px; color: #212529;">-${couponDiscount}%</div>
                                </td>
                              </tr>
                            `
                                : ""
                            }

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
                                <div style="margin-top: 5px; color: #212529;">${cartTotal.toFixed(
                                  2
                                )} ${t("currency")}</div>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding: 10px 0; border-top: 1px solid #dee2e6;">
                                <strong style="color: #495057;">${t(
                                  "delivery_address"
                                )}:</strong>
                                <div style="margin-top: 5px; color: #212529;">${address}</div>
                              </td>
                            </tr>

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

      return NextResponse.json(
        {
          success: true,
          message: checkoutT("order_placed"),
          orderIds,
        },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    const errorMessage = checkoutT
      ? checkoutT("order_error")
      : "Error processing order";
    const failedMessage = checkoutT
      ? checkoutT("order_failed")
      : "Failed to create order";

    console.error(errorMessage, error);
    return NextResponse.json(
      {
        error: error.message || failedMessage,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
