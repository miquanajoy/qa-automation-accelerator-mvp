import type { ApiErrorCode } from "@/shared/http/api-response";

export class ApplicationError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 500) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.status = status;
  }
}
