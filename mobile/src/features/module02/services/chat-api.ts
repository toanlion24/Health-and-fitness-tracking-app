const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

export type ChatMessageDto = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type SendMessageResponse = {
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
};

async function apiFetch(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_BASE}/api/v1${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  return res;
}

export async function listChatMessages(
  accessToken: string,
  options: { before?: string; limit?: number } = {},
): Promise<ChatMessageDto[]> {
  const params = new URLSearchParams();
  if (options.before) params.set("before", options.before);
  if (options.limit) params.set("limit", String(options.limit));

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/chat/messages${query}`, accessToken);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to load messages" }));
    throw new Error(err.message ?? "Failed to load messages");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function sendChatMessage(
  accessToken: string,
  content: string,
): Promise<SendMessageResponse> {
  const res = await apiFetch("/chat/messages", accessToken, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to send message" }));
    throw new Error(err.message ?? "Failed to send message");
  }

  return res.json();
}
