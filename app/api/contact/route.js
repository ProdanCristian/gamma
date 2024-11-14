import { NextResponse } from "next/server";
import db from "@/lib/db";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";

export async function POST(req) {
  try {
    const t = await getTranslations("contact");
    const { name, phone, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: t("missing_fields") }, { status: 400 });
    }

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

    try {
      await transporter.verify();
      console.log(t("smtp_verified"));
    } catch (verifyError) {
      console.error(t("smtp_error"), verifyError);
      return NextResponse.json(
        { error: t("email_config_error") },
        { status: 500 }
      );
    }

    const adminMailOptions = {
      from: {
        name: "Gamma Contact",
        address: process.env.EMAIL_USER,
      },
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: t("new_submission_from", { name }),
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t("new_contact_submission")}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <!-- Header -->
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #343746;">
                <table role="presentation" style="width: 100%; max-width: 1200px; margin: 0 auto;">
                  <tr>
                    <td style="text-align: center;">
                      <img src="${
                        process.env.NEXT_PUBLIC_BASE_URL
                      }/logo.png" alt="Gamma Logo" style="height: 50px; width: auto; vertical-align: middle;">
                      <span style="color: white; margin-left: 20px; font-size: 24px; vertical-align: middle;">${t(
                        "contact_form"
                      )}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 1200px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 30px;">
                      <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                        ${t("new_contact_submission")}
                      </h1>
                      
                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                              <strong style="color: #495057;">${t(
                                "your_name"
                              )}:</strong>
                              <div style="margin-top: 5px; color: #212529;">${name}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                              <strong style="color: #495057;">${t(
                                "email_address"
                              )}:</strong>
                              <div style="margin-top: 5px; color: #212529;">${email}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                              <strong style="color: #495057;">${t(
                                "phone_number"
                              )}:</strong>
                              <div style="margin-top: 5px; color: #212529;">${
                                phone || t("not_provided")
                              }</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <strong style="color: #495057;">${t(
                                "message"
                              )}:</strong>
                              <div style="margin-top: 10px; color: #212529; white-space: pre-wrap; line-height: 1.5;">${message}</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 20px; text-align: center; color: #666666; font-size: 12px;">
                <p style="margin: 0;">© 2024 Gamma. ${t(
                  "all_rights_reserved"
                )}</p>
                <p style="margin: 10px 0 0 0;">
                  Strada Sfîntul Gheorghe 6, Chișinău, Moldova | Tel: 022897007 | Email:info@gamma.md
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const senderMailOptions = {
      from: {
        name: "Gamma",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: t("thank_you_for_contact"),
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t("thank_you_for_contact")}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #343746;">
                <table role="presentation" style="width: 100%; max-width: 1200px; margin: 0 auto;">
                  <tr>
                    <td style="text-align: center;">
                      <img src="${
                        process.env.NEXT_PUBLIC_BASE_URL
                      }/Gamma.png" alt="Gamma Logo" style="height: 50px; width: auto; vertical-align: middle;">
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 1200px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 30px;">
                      <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                        ${t("thank_you_for_contact")}
                      </h1>
                      
                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; color: #212529;">
                        <p>${t("confirmation_message")}</p>
                        <p>${t("we_will_contact_soon")}</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 20px; text-align: center; color: #666666; font-size: 12px;">
                <p style="margin: 0;">© 2024 Gamma. ${t(
                  "all_rights_reserved"
                )}</p>
                <p style="margin: 10px 0 0 0;">
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
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(senderMailOptions);
      console.log(t("email_sent"));
    } catch (emailError) {
      console.error(t("email_error"), emailError);
      return NextResponse.json({ error: t("failed_to_send") }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: t("form_submitted"),
    });
  } catch (error) {
    console.error(t("submission_error"), error);
    return NextResponse.json(
      { error: error.message || t("failed_to_submit") },
      { status: 500 }
    );
  }
}
