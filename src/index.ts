import { sendMessage, sendDocument } from "./telegram";
import { parseEvent } from "./ai-parser";
import { generateIcs } from "./ics";
import { buildGCalLink } from "./gcal-link";

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  GEMINI_API_KEY: string;
}

interface TelegramMessage {
  from?: { id: number };
  chat: { id: number };
  text?: string;
}

interface TelegramUpdate {
  message?: TelegramMessage;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST" && new URL(request.url).pathname === "/webhook") {
      const update = (await request.json()) as TelegramUpdate;
      await handleUpdate(update, env);
    }
    return new Response("ok");
  },
};

async function handleUpdate(update: TelegramUpdate, env: Env): Promise<void> {
  const msg = update.message;
  if (!msg?.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text.startsWith("/start")) {
    await sendMessage(
      chatId,
      "👋 Send or forward any message that describes an event — I'll turn it into a calendar file you can add to Google Calendar, Apple Calendar, or Outlook.",
      env.TELEGRAM_BOT_TOKEN,
    );
    return;
  }

  if (text.startsWith("/")) return;

  let result;
  try {
    result = await parseEvent(text, env.GEMINI_API_KEY);
  } catch {
    await sendMessage(chatId, "❌ Something went wrong. Please try again.", env.TELEGRAM_BOT_TOKEN);
    return;
  }

  if ("error" in result) {
    await sendMessage(
      chatId,
      "I couldn't find a date or time in that message. What date and time should I use?",
      env.TELEGRAM_BOT_TOKEN,
    );
    return;
  }

  const gcalLink = buildGCalLink(result);
  const timeLabel = result.startTime === null
    ? "All day"
    : result.endTime
      ? `${result.startTime} – ${result.endTime}`
      : result.startTime;

  await sendMessage(
    chatId,
    `📅 <b>${result.title}</b>\n${result.date} · ${timeLabel}${result.location ? `\n📍 ${result.location}` : ""}\n\n<a href="${gcalLink}">Add to Google Calendar</a>`,
    env.TELEGRAM_BOT_TOKEN,
  );

  const ics = generateIcs(result);
  await sendDocument(chatId, "event.ics", ics, "text/calendar", env.TELEGRAM_BOT_TOKEN);
}
