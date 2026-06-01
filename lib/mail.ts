import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `[SamaSangha Contact] ${data.subject ?? "New message"} — ${data.name}`,
    text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    html: `<p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p><p>${data.message.replace(/\n/g, "<br/>")}</p>`,
  });
}
