import nodemailer from "nodemailer";
import type { Event, EventRegistration } from "@prisma/client";

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

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export async function sendRegistrationEmails({
  event,
  registration,
  waitlisted,
}: {
  event: Event;
  registration: EventRegistration;
  waitlisted: boolean;
}) {
  const subject = waitlisted
    ? `You're on the waitlist — ${event.title}`
    : `Registration received — ${event.title}`;

  const dateStr = `${formatDate(event.startDate)}${event.endDate ? ` – ${formatDate(event.endDate)}` : ""}`;
  const locationStr = event.isOnline ? "Online" : (event.location ?? "");

  // Email to registrant
  const registrantHtml = waitlisted
    ? `
      <p>Dear ${registration.name},</p>
      <p>Thank you for registering for <strong>${event.title}</strong>. The retreat is currently full, so you have been added to the <strong>waitlist</strong>.</p>
      <p>We will contact you as soon as a space opens up.</p>
      <p><strong>Event:</strong> ${event.title}<br/>
      <strong>Date:</strong> ${dateStr}<br/>
      ${locationStr ? `<strong>Location:</strong> ${locationStr}<br/>` : ""}
      </p>
      <p>In the meantime, feel free to reply to this email with any questions.</p>
      <p>With gratitude,<br/>SamaSangha</p>
    `
    : `
      <p>Dear ${registration.name},</p>
      <p>We have received your registration for <strong>${event.title}</strong>. We look forward to gathering with you.</p>
      <p><strong>Event:</strong> ${event.title}<br/>
      <strong>Date:</strong> ${dateStr}<br/>
      ${locationStr ? `<strong>Location:</strong> ${locationStr}<br/>` : ""}
      </p>
      ${registration.dietary ? `<p><strong>Dietary notes on file:</strong> ${registration.dietary}</p>` : ""}
      ${registration.notes ? `<p><strong>Your notes:</strong> ${registration.notes}</p>` : ""}
      <p>You will receive further details closer to the event. If you need to cancel or have questions, simply reply to this email.</p>
      <p>With gratitude,<br/>SamaSangha · Northeast Sufi Circle</p>
    `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: registration.email,
    subject,
    html: registrantHtml,
  });

  // Admin notification
  const adminHtml = `
    <p><strong>New ${waitlisted ? "waitlist " : ""}registration</strong> for <strong>${event.title}</strong></p>
    <table>
      <tr><td><strong>Name</strong></td><td>${registration.name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${registration.email}</td></tr>
      ${registration.phone ? `<tr><td><strong>Phone</strong></td><td>${registration.phone}</td></tr>` : ""}
      ${registration.dietary ? `<tr><td><strong>Dietary</strong></td><td>${registration.dietary}</td></tr>` : ""}
      ${registration.notes ? `<tr><td><strong>Notes</strong></td><td>${registration.notes}</td></tr>` : ""}
      <tr><td><strong>Status</strong></td><td>${waitlisted ? "WAITLISTED" : "PENDING"}</td></tr>
    </table>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `[SamaSangha] New ${waitlisted ? "waitlist " : ""}registration — ${event.title} — ${registration.name}`,
    html: adminHtml,
  });
}
