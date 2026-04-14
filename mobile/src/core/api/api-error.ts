import type { ApiErrorBody } from "@health-fitness/shared";

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(
      typeof body === "object" && body !== null && "message" in body
        ? String((body as ApiErrorBody).message)
        : `Request failed (${status})`,
    );
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }
}
