import type { EventDetails } from "./ai-parser";

export function generateIcs(event: EventDetails): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@calendarbot`;
  const dtstamp = utcStamp(new Date());

  let dtstart: string;
  let dtend: string;

  if (event.startTime === null) {
    const dateCompact = event.date.replace(/-/g, "");
    const nextDateCompact = nextDay(event.date);
    dtstart = `DTSTART;VALUE=DATE:${dateCompact}`;
    dtend = `DTEND;VALUE=DATE:${nextDateCompact}`;
  } else {
    dtstart = `DTSTART:${localStamp(event.date, event.startTime)}`;
    dtend = `DTEND:${event.endTime ? localStamp(event.date, event.endTime) : localStamp(event.date, addHour(event.startTime))}`;
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CalendarBot//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    dtstart,
    dtend,
    `SUMMARY:${escape(event.title)}`,
  ];

  if (event.location) lines.push(`LOCATION:${escape(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escape(event.description)}`);

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n") + "\r\n";
}

function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
}

function localStamp(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function nextDay(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
