import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

async function initializeTransporter() {
  if (transporter) return transporter;

  // For development: use Ethereal (free testing email service)
  // For production: configure with real SMTP settings from environment variables
  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Development: use Ethereal for free testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

export async function sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
  const transporter = await initializeTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@welfare-charity.com",
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9fafb;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            h1 {
              color: #1f2937;
              margin: 20px 0;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              padding: 12px 32px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .link-text {
              word-break: break-all;
              color: #2563eb;
              font-size: 12px;
              margin-top: 20px;
              padding: 15px;
              background: #eff6ff;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🤝 Welfare Charity</div>
              </div>
              <h1>Verify Your Email Address</h1>
              <p>Welcome to Welfare Charity! We're excited to have you join our community.</p>
              <p>To complete your registration and start making an impact, please verify your email address by clicking the button below:</p>
              
              <a href="${verificationLink}" class="button">Verify Your Email</a>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-text">${verificationLink}</div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
              
              <div class="footer">
                <p>© 2024 Welfare Charity. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@welfare-charity.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // In development, log the Ethereal preview URL
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Verification email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("📧 Verification email sent to:", email);
  }
}

export async function sendResendVerificationEmail(email: string, verificationLink: string): Promise<void> {
  const transporter = await initializeTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@welfare-charity.com",
    to: email,
    subject: "Resend: Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9fafb;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            h1 {
              color: #1f2937;
              margin: 20px 0;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              padding: 12px 32px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .link-text {
              word-break: break-all;
              color: #2563eb;
              font-size: 12px;
              margin-top: 20px;
              padding: 15px;
              background: #eff6ff;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🤝 Welfare Charity</div>
              </div>
              <h1>Verify Your Email Address</h1>
              <p>You requested a new verification link. Please click the button below to verify your email address:</p>
              
              <a href="${verificationLink}" class="button">Verify Your Email</a>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-text">${verificationLink}</div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 24 hours. If you didn't request this link, please ignore this email.
              </p>
              
              <div class="footer">
                <p>© 2024 Welfare Charity. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@welfare-charity.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // In development, log the Ethereal preview URL
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Resend verification email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("📧 Resend verification email sent to:", email);
  }
}
