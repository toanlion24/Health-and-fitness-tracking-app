/**
 * Typed API client wrapping fetchApi.
 * Stores use api.get / api.post / api.patch / api.delete.
 * @/core/lib/api provides the lower-level fetchApi utility.
 */
import { fetchApi } from "@/core/lib/api";

type ApiResponse<T> = {
  data: T;
  status: number;
  ok: boolean;
};

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const response = await fetchApi(endpoint, {
    method,
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const data = await response.json();
  return { data, status: response.status, ok: response.ok };
}

export const api = {
  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return request<T>("GET", endpoint);
  },

  post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>("POST", endpoint, body);
  },

  patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>("PATCH", endpoint, body);
  },

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return request<T>("DELETE", endpoint);
  },
};
