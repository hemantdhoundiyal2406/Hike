import nodemailer from "nodemailer";
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function getMailConfig() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL } = process.env;
    if (!SMTP_HOST ||
        !SMTP_PORT ||
        !SMTP_USER ||
        !SMTP_PASS ||
        !SMTP_FROM ||
        !ADMIN_EMAIL) {
        throw new Error("SMTP email configuration is incomplete.");
    }
    return {
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        user: SMTP_USER,
        pass: SMTP_PASS,
        from: SMTP_FROM,
        admin: ADMIN_EMAIL,
    };
}
function createTransporter() {
    const config = getMailConfig();
    return {
        config,
        transporter: nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        }),
    };
}
function bookingRows(booking) {
    const rows = [
        ["Client", booking.name],
        ["Email", booking.email],
        ["Phone", booking.phone],
        ["Brand / company", booking.brandName],
        ["Meeting topic", booking.meetingTopic],
        ["Website type", booking.websiteType],
        ["Date", booking.date],
        ["Time", booking.time],
        ...(booking.durationMinutes
            ? [["Duration", `${booking.durationMinutes} minutes`]]
            : []),
        ...(booking.timezone ? [["Timezone", booking.timezone]] : []),
        ...(booking.meetingLink ? [["Meeting link", booking.meetingLink]] : []),
        ...(booking.status
            ? [["Status", booking.status[0].toUpperCase() + booking.status.slice(1)]]
            : []),
    ];
    return rows
        .map(([label, value]) => `
        <tr>
          <td style="padding:8px 12px;color:#8b8499">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;color:#f5f3ff;font-weight:600">${escapeHtml(value)}</td>
        </tr>`)
        .join("");
}
function emailFrame(title, intro, booking) {
    const meetingButton = booking.meetingLink
        ? `
      <p style="margin:22px 0 0">
        <a href="${escapeHtml(booking.meetingLink)}" style="display:inline-block;padding:12px 18px;border-radius:9px;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700">
          Join meeting
        </a>
      </p>`
        : "";
    return `
    <div style="background:#07070c;padding:32px;font-family:Arial,sans-serif;color:#f5f3ff">
      <div style="max-width:640px;margin:auto;border:1px solid #2a213a;border-radius:18px;overflow:hidden;background:#0d0b15">
        <div style="padding:28px;background:linear-gradient(135deg,#32156a,#7c3aed)">
          <p style="margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#e9d5ff">hike agency</p>
          <h1 style="margin:0;font-size:26px">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:28px">
          <p style="margin:0 0 22px;line-height:1.7;color:#c9c3d4">${escapeHtml(intro)}</p>
          <table style="width:100%;border-collapse:collapse;background:#090811;border-radius:12px">${bookingRows(booking)}</table>
          <div style="margin-top:20px;padding:16px;border-left:3px solid #8b5cf6;background:#12101c">
            <strong style="display:block;margin-bottom:8px">Project message</strong>
            <p style="margin:0;white-space:pre-line;line-height:1.7;color:#c9c3d4">${escapeHtml(booking.message)}</p>
          </div>
          ${meetingButton}
        </div>
      </div>
    </div>`;
}
function calendarAttachment(booking) {
    const duration = booking.durationMinutes ?? 30;
    const timezone = booking.timezone || "Asia/Kolkata";
    const start = new Date(`${booking.date}T${booking.time}:00Z`);
    const end = new Date(start.getTime() + duration * 60_000);
    const formatCalendarDate = (value) => [
        value.getUTCFullYear(),
        String(value.getUTCMonth() + 1).padStart(2, "0"),
        String(value.getUTCDate()).padStart(2, "0"),
        "T",
        String(value.getUTCHours()).padStart(2, "0"),
        String(value.getUTCMinutes()).padStart(2, "0"),
        "00",
    ].join("");
    const clean = (value) => value
        .replaceAll("\\", "\\\\")
        .replaceAll("\n", "\\n")
        .replaceAll(",", "\\,")
        .replaceAll(";", "\\;");
    const uid = `${booking.date}-${booking.time}-${booking.email}@hikeagency.com`;
    const content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//hike agency//Meeting//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:${clean(uid)}`,
        `DTSTAMP:${formatCalendarDate(new Date())}Z`,
        `DTSTART;TZID=${clean(timezone)}:${formatCalendarDate(start)}`,
        `DTEND;TZID=${clean(timezone)}:${formatCalendarDate(end)}`,
        `SUMMARY:${clean(`hike agency meeting - ${booking.brandName}`)}`,
        `DESCRIPTION:${clean(booking.message)}`,
        ...(booking.meetingLink ? [`URL:${clean(booking.meetingLink)}`] : []),
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
    return {
        filename: "hike-agency-meeting.ics",
        content,
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
    };
}
export async function sendBookingCreatedEmails(booking) {
    const { config, transporter } = createTransporter();
    const emailBooking = {
        ...booking,
        status: "pending",
        durationMinutes: 30,
        timezone: "Asia/Kolkata",
    };
    const attachment = calendarAttachment(emailBooking);
    await Promise.all([
        transporter.sendMail({
            from: config.from,
            to: config.admin,
            replyTo: booking.email,
            subject: `New booking: ${booking.brandName}`,
            html: emailFrame("New booking request", "A new discovery call request has been submitted.", emailBooking),
            attachments: [attachment],
        }),
        transporter.sendMail({
            from: config.from,
            to: booking.email,
            subject: "Your hike agency booking request",
            html: emailFrame("Your request is in", "Thanks for reaching out. We received your booking and will confirm the next step shortly.", emailBooking),
            attachments: [attachment],
        }),
    ]);
}
export async function sendBookingUpdatedEmails(booking) {
    const { config, transporter } = createTransporter();
    const statusLabel = booking.status[0].toUpperCase() + booking.status.slice(1);
    const attachment = calendarAttachment(booking);
    await Promise.all([
        transporter.sendMail({
            from: config.from,
            to: config.admin,
            replyTo: booking.email,
            subject: `Booking updated: ${booking.brandName} - ${statusLabel}`,
            html: emailFrame("Booking updated", "The admin dashboard saved the following booking changes.", booking),
            attachments: [attachment],
        }),
        transporter.sendMail({
            from: config.from,
            to: booking.email,
            subject: `Your hike agency booking is ${statusLabel}`,
            html: emailFrame("Your booking was updated", `Your booking status is now ${statusLabel}. The latest details are below.`, booking),
            attachments: [attachment],
        }),
    ]);
}
export async function sendMeetingScheduledEmails(booking) {
    const { config, transporter } = createTransporter();
    const attachment = calendarAttachment(booking);
    await Promise.all([
        transporter.sendMail({
            from: config.from,
            to: config.admin,
            replyTo: booking.email,
            subject: `Meeting scheduled: ${booking.brandName}`,
            html: emailFrame("Meeting scheduled", "A meeting was created from the hike agency admin dashboard.", booking),
            attachments: [attachment],
        }),
        transporter.sendMail({
            from: config.from,
            to: booking.email,
            subject: "Your hike agency meeting is scheduled",
            html: emailFrame("Your meeting is scheduled", "Your meeting details are confirmed below. Please keep this email for your records.", booking),
            attachments: [attachment],
        }),
    ]);
}
