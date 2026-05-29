export interface EventDetails {
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description: string | null;
}

export type ParseResult = EventDetails | { error: "no_datetime" };

const SYSTEM_PROMPT = `You extract calendar event details from text.
Return JSON only, no markdown, no explanation.
Format: {"title":"...","date":"YYYY-MM-DD","startTime":"HH:MM or null","endTime":"HH:MM or null","location":"... or null","description":"... or null"}
If no time of day is mentioned, set startTime and endTime to null (full-day event).
If the date cannot be determined from the text, return: {"error":"no_datetime"}
Today's date for reference: `;

export async function parseEvent(
  text: string,
  geminiApiKey: string,
): Promise<ParseResult> {
  const today = new Date().toISOString().split("T")[0];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: SYSTEM_PROMPT + today + "\n\nMessage:\n" + text,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    candidates: Array<{
      content: { parts: Array<{ text: string }> };
    }>;
  };

  const raw = data.candidates[0].content.parts[0].text;
  return JSON.parse(raw) as ParseResult;
}
