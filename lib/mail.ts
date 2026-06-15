import nodemailer from "nodemailer";
import type { Booking, Event, EventRegistration } from "@prisma/client";

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
    subject: `[SamaSangha Contact] ${data.subject ?? "New message"}, ${data.name}`,
    text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    html: `<p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p><p>${data.message.replace(/\n/g, "<br/>")}</p>`,
  });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const CHECK_PAYABLE_TO = process.env.CHECK_PAYABLE_TO || "SamaSangha";
const CHECK_MAILING_ADDRESS = process.env.CHECK_MAILING_ADDRESS || "";

export async function sendBookingEmails({
  event,
  booking,
  participants,
}: {
  event: Event;
  booking: Booking;
  participants: EventRegistration[];
}) {
  const waitlisted = booking.status === "WAITLISTED";
  const isCheck = booking.paymentMethod === "CHECK";
  const isPaid = booking.paymentStatus === "PAID";

  const dateStr = `${formatDate(event.startDate)}${event.endDate ? ` – ${formatDate(event.endDate)}` : ""}`;
  const locationStr = event.isOnline ? "Online" : (event.location ?? "");

  const participantsHtml = participants
    .map(
      (p) =>
        `<li>${p.name}${p.isChild ? " (18 &amp; under)" : ""}${p.dietary ? ` — ${p.dietary}` : ""}</li>`
    )
    .join("");
  const participantList = `<p><strong>Participants:</strong></p><ul>${participantsHtml}</ul>`;

  const eventBlock = `
    <p><strong>Event:</strong> ${event.title}<br/>
    <strong>Date:</strong> ${dateStr}<br/>
    ${locationStr ? `<strong>Location:</strong> ${locationStr}<br/>` : ""}
    </p>`;

  // Payment status / instructions block for the registrant.
  let paymentBlock = "";
  if (booking.amountCents > 0) {
    if (isCheck && !isPaid) {
      const addressLine = CHECK_MAILING_ADDRESS
        ? `<p>Please mail a check for <strong>${dollars(booking.amountCents)}</strong>, payable to <strong>${CHECK_PAYABLE_TO}</strong>, to:</p>
           <p style="white-space:pre-line;margin-left:1rem">${CHECK_MAILING_ADDRESS}</p>`
        : `<p>Please mail a check for <strong>${dollars(booking.amountCents)}</strong>, payable to <strong>${CHECK_PAYABLE_TO}</strong>. Reply to this email and we'll send you the mailing address.</p>`;
      paymentBlock = `
        <div style="border:1px solid #e6dcc3;background:#faf6ec;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Payment by check, action needed</strong></p>
          ${addressLine}
          <p style="margin:8px 0 0"><strong>Your registration is not complete until your check is received.</strong> We'll email you a confirmation once it arrives.</p>
        </div>`;
    } else if (isPaid) {
      paymentBlock = `<p><strong>Payment received:</strong> ${dollars(booking.amountCents)} (paid online). Thank you!</p>`;
    } else {
      paymentBlock = `<p><strong>Amount:</strong> ${dollars(booking.amountCents)}</p>`;
    }
  }

  let subject: string;
  if (waitlisted) subject = `You're on the waitlist, ${event.title}`;
  else if (isCheck && !isPaid) subject = `Almost there — complete your registration for ${event.title}`;
  else subject = `Registration confirmed, ${event.title}`;

  const intro = waitlisted
    ? `<p>Dear ${booking.name},</p>
       <p>Thank you for registering for <strong>${event.title}</strong>. It is currently full, so your party has been added to the <strong>waitlist</strong>. We'll contact you as soon as space opens up.</p>`
    : isCheck && !isPaid
      ? `<p>Dear ${booking.name},</p>
         <p>Thank you for registering for <strong>${event.title}</strong>. One more step remains — see the payment details below.</p>`
      : `<p>Dear ${booking.name},</p>
         <p>We've received your registration for <strong>${event.title}</strong>. We look forward to gathering with you.</p>`;

  const registrantHtml = `
    ${intro}
    ${eventBlock}
    ${participantList}
    ${waitlisted ? "" : paymentBlock}
    ${booking.notes ? `<p><strong>Your notes:</strong> ${booking.notes}</p>` : ""}
    <p>If you have any questions, simply reply to this email.</p>
    <p>With gratitude,<br/>SamaSangha</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: booking.email,
    subject,
    html: registrantHtml,
  });

  // Admin notification
  const paymentSummary = waitlisted
    ? "Waitlist (no payment)"
    : booking.amountCents === 0
      ? "Free"
      : `${dollars(booking.amountCents)} · ${booking.paymentMethod} · ${booking.paymentStatus}`;

  const adminHtml = `
    <p><strong>New ${waitlisted ? "waitlist " : ""}registration</strong> for <strong>${event.title}</strong></p>
    <table cellpadding="4">
      <tr><td><strong>Contact</strong></td><td>${booking.name} &lt;${booking.email}&gt;</td></tr>
      ${booking.phone ? `<tr><td><strong>Phone</strong></td><td>${booking.phone}</td></tr>` : ""}
      <tr><td><strong>Party size</strong></td><td>${participants.length}</td></tr>
      <tr><td><strong>Payment</strong></td><td>${paymentSummary}</td></tr>
      ${booking.notes ? `<tr><td><strong>Notes</strong></td><td>${booking.notes}</td></tr>` : ""}
    </table>
    ${participantList}
    ${isCheck && !isPaid ? "<p><em>Awaiting check — mark the payment received in the admin once it arrives.</em></p>" : ""}
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `[SamaSangha] ${waitlisted ? "Waitlist" : "Registration"}, ${event.title}, ${booking.name}`,
    html: adminHtml,
  });
}
