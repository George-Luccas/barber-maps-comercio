
import nodemailer from "nodemailer";

export async function sendEmail(email: string, link: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Barber Maps" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Recuperação de Senha - Barber Maps",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Redefinir sua senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no Barber Maps.</p>
        <p>Se você não solicitou isso, pode ignorar este email com segurança.</p>
        <p>Para criar uma nova senha, clique no botão abaixo:</p>
        <a href="${link}" style="display: inline-block; background-color: #CCFF00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Redefinir Senha</a>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">O link expira em 15 minutos.</p>
      </div>
    `,
  });
}
