import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export function jsonResponse<TBody>(body: TBody, status = 200): NextResponse<TBody> {
  return NextResponse.json(body, { status });
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message
      }
    },
    { status }
  );
}
