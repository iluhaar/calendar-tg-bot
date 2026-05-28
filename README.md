# Calendar Bot

A Telegram bot that turns messages into calendar events. Send or forward any text describing an event — the bot extracts the details using Gemini AI and replies with a Google Calendar link and an `.ics` file.

## How it works

1. Send or forward a message to the bot, e.g. _"Team standup tomorrow at 10am"_
2. Gemini Flash extracts the event title, date, time, and location
3. The bot replies with:
   - A **Google Calendar link** — tap to add instantly
   - An **`event.ics` file** — for Apple Calendar, Outlook, or any other calendar app

If the message doesn't contain a date or time, the bot asks for clarification.

## Stack

- **Runtime**: Cloudflare Workers (TypeScript)
- **Telegram**: Raw Bot API via `fetch` — no framework
- **AI**: Google Gemini Flash — extracts structured event data from natural language
- **Calendar**: Google Calendar deep link + iCalendar (`.ics`) file generation
- **Storage**: None — fully stateless

## Setup

### 1. Create a Telegram bot

1. Open Telegram → search `@BotFather` → send `/newbot`
2. Follow the prompts to set a name and username
3. Save the `BOT_TOKEN`

### 2. Get a Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key** → **Create API key**
3. Save the key as `GEMINI_API_KEY`

### 3. Deploy to Cloudflare Workers

```bash
npm install -g wrangler
wrangler login

wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put GEMINI_API_KEY

wrangler deploy
```

Note the worker URL printed after deploy (e.g. `https://calendar-bot.yourname.workers.dev`).

### 4. Register the Telegram webhook

Open this URL in a browser (replace the placeholders):

```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://calendar-bot.yourname.workers.dev/webhook
```

You should get `{"ok":true}`. To verify:

```
https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```

## Commands

| Command | Description |
|---|---|
| `/start` | Show usage instructions |

Any other text message triggers event extraction.
