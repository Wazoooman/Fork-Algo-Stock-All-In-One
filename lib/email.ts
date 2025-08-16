import { Resend } from "resend"

const resend = new Resend(process.env.RESENDAPI)

export class EmailService {
  static async sendVerificationEmail(email: string, token: string, firstName: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`

    try {
      await resend.emails.send({
        from: "MarketDesk <noreply@yourdomain.com>", // Replace with your domain
        to: email,
        subject: "Verify your MarketDesk account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to MarketDesk!</h1>
            <p>Hi ${firstName},</p>
            <p>Thank you for signing up for MarketDesk. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with MarketDesk, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">MarketDesk - Your Algorithmic Stock Screener</p>
          </div>
        `,
      })
      return { success: true }
    } catch (error) {
      console.error("Failed to send verification email:", error)
      return { success: false, error: "Failed to send verification email" }
    }
  }

  static async sendWelcomeEmail(email: string, firstName: string) {
    try {
      await resend.emails.send({
        from: "MarketDesk <noreply@yourdomain.com>", // Replace with your domain
        to: email,
        subject: "Welcome to MarketDesk - Your account is verified!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Account Verified Successfully!</h1>
            <p>Hi ${firstName},</p>
            <p>Your MarketDesk account has been successfully verified. You can now access all features including:</p>
            <ul>
              <li>Create and manage watchlists</li>
              <li>Track your trade history</li>
              <li>Use advanced stock screening tools</li>
              <li>Customize your preferences</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Using MarketDesk
              </a>
            </div>
            <p>Happy trading!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">MarketDesk - Your Algorithmic Stock Screener</p>
          </div>
        `,
      })
      return { success: true }
    } catch (error) {
      console.error("Failed to send welcome email:", error)
      return { success: false, error: "Failed to send welcome email" }
    }
  }
}
