import type { EventDetails } from "./ai-parser";

export function buildGCalLink(event: EventDetails): string {
  let datesParam: string;

  if (event.startTime === null) {
    const startDate = event.date.replace(/-/g, "");
    const endDate = nextDay(event.date);
    datesParam = `${startDate}/${endDate}`;
  } else {
    const start = toGCalStamp(event.date, event.startTime);
    const end = toGCalStamp(event.date, event.endTime ?? addHour(event.startTime));
    datesParam = `${start}/${end}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: datesParam,
  });

  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);

  return `https://calendar.google.com/calendar/render?${params}`;
}

function toGCalStamp(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function nextDay(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
