import type { EventDetails } from "./ai-parser";

export function buildGCalLink(event: EventDetails): string {
  const start = toGCalStamp(event.date, event.startTime);
  const end = toGCalStamp(
    event.date,
    event.endTime ?? addHour(event.startTime),
  );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
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
