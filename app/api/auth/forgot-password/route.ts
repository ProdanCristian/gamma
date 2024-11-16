import { NextResponse } from "next/server";
import db from "@/lib/db";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, locale } = await req.json();

    const t = await getTranslations({ locale, namespace: "auth" });

    if (!email) {
      return NextResponse.json({ error: t("email_required") }, { status: 400 });
    }

    // Check if user exists
    const { rows } = await db.query(
      'SELECT * FROM "nc_pka4___Utilizatori" WHERE "Email" = $1',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: t("user_not_found") }, { status: 404 });
    }

    const user = rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await db.query(
      `UPDATE "nc_pka4___Utilizatori" 
       SET "ResetToken" = $1, "ResetTokenExpiry" = $2 
       WHERE "Email" = $3`,
      [resetToken, resetTokenExpiry, email]
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: "Gamma",
        address: process.env.EMAIL_USER!,
      },
      to: email,
      subject: t("reset_password_subject"),
      html: `
        <!DOCTYPE html>
        <html lang="${locale}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t("reset_password_subject")}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #343746;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
                  <tr>
                    <td style="text-align: center;">
                      <img src="
                        https://gamma.md/Gamma.png" alt="Gamma Logo" style="height: 50px; width: auto; vertical-align: middle;">
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 30px; text-align: center;">
                      <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                        ${t("reset_password_heading")}
                      </h1>
                      
                      <div style="color: #212529;">
                        <p style="margin: 0 0 20px 0; line-height: 1.6; text-align: center;">${t(
                          "reset_password_instructions"
                        )}</p>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${resetUrl}" style="background-color: #343746; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            ${t("reset_password_button")}
                          </a>
                        </div>
                        <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.4; text-align: center;">
                          ${t("reset_password_expiry")}
                        </p>
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

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: t("reset_email_sent"),
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
