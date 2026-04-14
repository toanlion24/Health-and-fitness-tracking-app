import type { ApiErrorBody } from "@health-fitness/shared";
import type { RefreshResponseDto } from "@health-fitness/shared";
import { apiBaseUrl } from "../config/env";
import { ApiClientError } from "./api-error";
import { getAuthSessionHandlers } from "./auth-bridge";

export type ApiFetchOptions = RequestInit & {
  accessToken?: string | null;
  /**
   * When true, sends Authorization from session (see auth-bridge) and retries once
   * on 401 after refreshing tokens.
   */
  auth?: boolean;
};

function buildUrl(path: string): string {
  return `${apiBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** When fetch() fails before any HTTP response (offline, wrong host, blocked cleartext). */
function networkFailureMessage(): ApiErrorBody {
  return {
    code: "NETWORK_ERROR",
    message:
      `Không kết nối được máy chủ API (${apiBaseUrl}). ` +
      `Kiểm tra: (1) Backend đã chạy chưa (npm run dev:backend). ` +
      `(2) Điện thoại thật: đặt EXPO_PUBLIC_API_URL = http://<IP-LAN-máy-tính>:3000, không dùng 127.0.0.1. ` +
      `(3) Android emulator: dùng http://10.0.2.2:3000. ` +
      `Sau khi sửa .env, cần khởi động lại Expo (clear cache: npx expo start -c).`,
    requestId: "client",
  };
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.length === 0) {
    return null;
  }
  return JSON.parse(text) as unknown;
}

async function tryRefreshSessionOnce(): Promise<boolean> {
  const h = getAuthSessionHandlers();
  if (!h) {
    return false;
  }
  const refreshToken = h.getRefreshToken();
  if (!refreshToken) {
    return false;
  }
  try {
    const res = await fetch(buildUrl("/api/v1/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const body = (await parseJsonResponse(res)) as unknown;
    if (!res.ok) {
      return false;
    }
    const data = body as RefreshResponseDto;
    if (!data.tokens?.accessToken || !data.tokens?.refreshToken) {
      return false;
    }
    await h.commitTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const useSession = options.auth === true;

  let token = options.accessToken;
  if (useSession && token === undefined) {
    token = getAuthSessionHandlers()?.getAccessToken() ?? null;
  }

  const { accessToken: _a, auth: _b, ...rest } = options;

  const exec = async (bearer: string | null): Promise<Response> => {
    const url = buildUrl(path);
    const headers = new Headers(rest.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (bearer) {
      headers.set("Authorization", `Bearer ${bearer}`);
    }
    return fetch(url, {
      ...rest,
      headers,
    });
  };

  if (useSession && !token) {
    throw new ApiClientError(401, {
      code: "UNAUTHORIZED",
      message: "Not authenticated",
      requestId: "client",
    });
  }

  let res: Response;
  try {
    res = await exec(token ?? null);
  } catch {
    throw new ApiClientError(0, networkFailureMessage());
  }
  let body = await parseJsonResponse(res);

  if (res.status === 401 && useSession && (await tryRefreshSessionOnce())) {
    const nextToken = getAuthSessionHandlers()?.getAccessToken() ?? null;
    try {
      res = await exec(nextToken);
    } catch {
      throw new ApiClientError(0, networkFailureMessage());
    }
    body = await parseJsonResponse(res);
  }

  if (!res.ok) {
    throw new ApiClientError(res.status, body);
  }

  return body as T;
}

export function isApiErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const b = body as Record<string, unknown>;
  return (
    typeof b.code === "string" &&
    typeof b.message === "string" &&
    typeof b.requestId === "string"
  );
}
