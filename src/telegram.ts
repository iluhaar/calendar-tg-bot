const BASE = "https://api.telegram.org/bot";

export async function sendMessage(
  chatId: number,
  text: string,
  token: string,
): Promise<void> {
  await fetch(`${BASE}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function sendDocument(
  chatId: number,
  filename: string,
  content: string,
  mimeType: string,
  token: string,
): Promise<void> {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(
    "document",
    new Blob([content], { type: mimeType }),
    filename,
  );

  await fetch(`${BASE}${token}/sendDocument`, {
    method: "POST",
    body: form,
  });
}
