import nodemailer from "nodemailer";
const DEFAULT_SMTP_PORT = 587;
const ENV_ALIASES = {
    url: ["SMTP_URL", "MAIL_URL", "EMAIL_SERVER", "EMAIL_SERVER_URL", "EMAIL_SMTP_URL"],
    service: ["SMTP_SERVICE", "MAIL_SERVICE", "EMAIL_SERVICE"],
    host: ["SMTP_HOST", "MAIL_HOST", "EMAIL_SERVER_HOST", "EMAIL_HOST"],
    port: ["SMTP_PORT", "MAIL_PORT", "EMAIL_SERVER_PORT", "EMAIL_PORT"],
    secure: ["SMTP_SECURE", "MAIL_SECURE", "EMAIL_SECURE"],
    user: [
        "SMTP_USER",
        "SMTP_USERNAME",
        "MAIL_USER",
        "EMAIL_USER",
        "EMAIL_SERVER_USER",
        "GMAIL_USER",
    ],
    pass: [
        "SMTP_PASS",
        "SMTP_PASSWORD",
        "MAIL_PASS",
        "MAIL_PASSWORD",
        "EMAIL_PASS",
        "EMAIL_PASSWORD",
        "EMAIL_SERVER_PASSWORD",
        "APP_PASSWORD",
        "GMAIL_PASS",
        "GMAIL_APP_PASSWORD",
        "GOOGLE_APP_PASSWORD",
    ],
    from: ["SMTP_FROM", "MAIL_FROM", "EMAIL_FROM", "SMTP_USER", "MAIL_USER", "EMAIL_USER"],
    fromName: ["SMTP_FROM_NAME", "MAIL_FROM_NAME", "EMAIL_FROM_NAME"],
    admin: [
        "ADMIN_NOTIFY_EMAIL",
        "NOTIFY_EMAIL",
        "SMTP_TO",
        "MAIL_TO",
        "EMAIL_TO",
        "ADMIN_EMAIL",
    ],
};
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function readEnv(names) {
    for (const name of names) {
        const value = process.env[name]?.trim();
        if (value) {
            return value;
        }
    }
    return "";
}
function readEnvEntry(names) {
    for (const name of names) {
        const value = process.env[name]?.trim();
        if (value) {
            return { name, value };
        }
    }
    return { name: "", value: "" };
}
function parseConnectionUrl(value) {
    if (!value)
        return null;
    try {
        const url = new URL(value);
        if (!["smtp:", "smtps:"].includes(url.protocol)) {
            throw new Error("EMAIL_SERVER/SMTP_URL must start with smtp:// or smtps://.");
        }
        return {
            host: url.hostname,
            port: url.port,
            secure: url.protocol === "smtps:",
            user: decodeURIComponent(url.username),
            pass: decodeURIComponent(url.password),
        };
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : "Invalid SMTP connection URL.");
    }
}
function parseBoolean(value, fallback) {
    if (!value)
        return fallback;
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}
function parsePort(value) {
    const port = Number(value || DEFAULT_SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`SMTP_PORT must be a valid port number. Received: ${value}`);
    }
    return port;
}
function getMailConfig() {
    const urlEntry = readEnvEntry(ENV_ALIASES.url);
    const urlConfig = parseConnectionUrl(urlEntry.value);
    const service = readEnv(ENV_ALIASES.service);
    const host = readEnv(ENV_ALIASES.host) || urlConfig?.host || "";
    const portValue = readEnv(ENV_ALIASES.port) || urlConfig?.port || "";
    const user = readEnv(ENV_ALIASES.user) || urlConfig?.user || "";
    const pass = readEnv(ENV_ALIASES.pass) || urlConfig?.pass || "";
    const from = readEnv(ENV_ALIASES.from);
    const fromName = readEnv(ENV_ALIASES.fromName);
    const admin = readEnv(ENV_ALIASES.admin);
    const missing = [];
    if (!urlEntry.value && !service && !host)
        missing.push("SMTP_HOST, SMTP_SERVICE, or SMTP_URL");
    if (!user)
        missing.push("SMTP_USER");
    if (!pass)
        missing.push("SMTP_PASS");
    if (!from && !user)
        missing.push("SMTP_FROM or SMTP_USER");
    if (!admin)
        missing.push("ADMIN_EMAIL");
    if (missing.length > 0) {
        throw new Error(`SMTP email configuration is incomplete. Missing: ${missing.join(", ")}.`);
    }
    const port = service && !host && !portValue ? DEFAULT_SMTP_PORT : parsePort(portValue);
    const secure = parseBoolean(readEnv(ENV_ALIASES.secure), urlConfig?.secure ?? port === 465);
    const useUrlTransport = Boolean(urlEntry.value && !service && !readEnv(ENV_ALIASES.host));
    return {
        url: useUrlTransport ? urlEntry.value : "",
        service,
        host,
        port,
        secure,
        user,
        pass,
        from: from || user,
        fromName,
        admin,
        transportType: useUrlTransport ? "url" : service && !host ? "service" : "smtp",
    };
}
function getSender(config) {
    if (!config.fromName)
        return config.from;
    return `"${config.fromName.replaceAll('"', '\\"')}" <${config.from}>`;
}
function createTransporter() {
    const config = getMailConfig();
    const transportOptions = config.url
        ? config.url
        : config.service && !config.host
        ? {
            service: config.service,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        }
        : {
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        };
    return {
        config,
        transporter: nodemailer.createTransport(transportOptions),
    };
}
export function getEmailErrorMessage(error) {
    return error instanceof Error ? error.message : "Unknown SMTP error.";
}
function getEnvelope(config, to) {
    const recipients = Array.isArray(to) ? to : [to];
    return {
        from: config.user || config.from,
        to: recipients,
    };
}
async function sendMessages(transporter, messages) {
    const failures = [];
    for (const { label, ...mailOptions } of messages) {
        try {
            await transporter.sendMail(mailOptions);
        }
        catch (error) {
            failures.push({
                label,
                message: getEmailErrorMessage(error),
            });
        }
    }
    if (failures.length > 0) {
        throw new Error(`Email delivery failed for ${failures
            .map((failure) => failure.label)
            .join(", ")}. ${failures
            .map((failure) => `${failure.label}: ${failure.message}`)
            .join(" ")}`);
    }
}
function maskEmail(value) {
    if (!value)
        return "";
    const [name, domain] = value.split("@");
    if (!domain)
        return value.length <= 4 ? "****" : `${value.slice(0, 2)}****${value.slice(-2)}`;
    return `${name.slice(0, 2)}****@${domain}`;
}
function getEnvPresence() {
    return Object.fromEntries(Object.entries(ENV_ALIASES).map(([key, names]) => [
        key,
        names.filter((name) => Boolean(process.env[name]?.trim())),
    ]));
}
export async function getEmailDiagnostics() {
    const envPresence = getEnvPresence();
    try {
        const { config, transporter } = createTransporter();
        await transporter.verify();
        return {
            configured: true,
            smtpVerified: true,
            transportType: config.transportType,
            host: config.host || "",
            port: config.port,
            secure: config.secure,
            service: config.service || "",
            user: maskEmail(config.user),
            from: maskEmail(config.from),
            admin: maskEmail(config.admin),
            fromMatchesUser: config.from.toLowerCase() === config.user.toLowerCase(),
            envPresence,
        };
    }
    catch (error) {
        return {
            configured: false,
            smtpVerified: false,
            error: getEmailErrorMessage(error),
            envPresence,
        };
    }
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
    const from = getSender(config);
    const emailBooking = {
        ...booking,
        status: "pending",
        durationMinutes: 30,
        timezone: "Asia/Kolkata",
    };
    const attachment = calendarAttachment(emailBooking);
    await sendMessages(transporter, [
        {
            label: "admin",
            from,
            envelope: getEnvelope(config, config.admin),
            to: config.admin,
            replyTo: booking.email,
            subject: `New booking: ${booking.brandName}`,
            html: emailFrame("New booking request", "A new discovery call request has been submitted.", emailBooking),
            attachments: [attachment],
        },
        {
            label: "client",
            from,
            envelope: getEnvelope(config, booking.email),
            to: booking.email,
            replyTo: config.admin,
            subject: "Your hike agency booking request",
            html: emailFrame("Your request is in", "Thanks for reaching out. We received your booking and will confirm the next step shortly.", emailBooking),
            attachments: [attachment],
        },
    ]);
}
export async function sendBookingUpdatedEmails(booking) {
    const { config, transporter } = createTransporter();
    const from = getSender(config);
    const statusLabel = booking.status[0].toUpperCase() + booking.status.slice(1);
    const attachment = calendarAttachment(booking);
    await sendMessages(transporter, [
        {
            label: "admin",
            from,
            envelope: getEnvelope(config, config.admin),
            to: config.admin,
            replyTo: booking.email,
            subject: `Booking updated: ${booking.brandName} - ${statusLabel}`,
            html: emailFrame("Booking updated", "The admin dashboard saved the following booking changes.", booking),
            attachments: [attachment],
        },
        {
            label: "client",
            from,
            envelope: getEnvelope(config, booking.email),
            to: booking.email,
            replyTo: config.admin,
            subject: `Your hike agency booking is ${statusLabel}`,
            html: emailFrame("Your booking was updated", `Your booking status is now ${statusLabel}. The latest details are below.`, booking),
            attachments: [attachment],
        },
    ]);
}
export async function sendMeetingScheduledEmails(booking) {
    const { config, transporter } = createTransporter();
    const from = getSender(config);
    const attachment = calendarAttachment(booking);
    await sendMessages(transporter, [
        {
            label: "admin",
            from,
            envelope: getEnvelope(config, config.admin),
            to: config.admin,
            replyTo: booking.email,
            subject: `Meeting scheduled: ${booking.brandName}`,
            html: emailFrame("Meeting scheduled", "A meeting was created from the hike agency admin dashboard.", booking),
            attachments: [attachment],
        },
        {
            label: "client",
            from,
            envelope: getEnvelope(config, booking.email),
            to: booking.email,
            replyTo: config.admin,
            subject: "Your hike agency meeting is scheduled",
            html: emailFrame("Your meeting is scheduled", "Your meeting details are confirmed below. Please keep this email for your records.", booking),
            attachments: [attachment],
        },
    ]);
}
