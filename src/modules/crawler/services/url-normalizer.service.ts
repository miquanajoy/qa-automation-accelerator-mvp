import { ApplicationError } from "@/shared/errors/application-error";

export function normalizeCrawlUrl(rawUrl: string): string {
  const trimmedUrl = rawUrl.trim();
  const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  try {
    const url = new URL(urlWithProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        "Only http:// and https:// URLs are supported",
        400
      );
    }

    if (!url.hostname.includes(".")) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        "Enter a valid domain, for example crawler-test.com",
        400
      );
    }

    return url.toString();
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      "VALIDATION_ERROR",
      "Enter a valid URL, for example crawler-test.com",
      400
    );
  }
}
