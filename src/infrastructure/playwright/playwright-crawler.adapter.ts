import { chromium, errors } from "playwright";
import { ApplicationError } from "@/shared/errors/application-error";

export type PlaywrightCrawlResult = {
  url: string;
  title: string | null;
  html: string;
};

export class PlaywrightCrawlerAdapter {
  async crawl(url: string): Promise<PlaywrightCrawlResult> {
    let browser;

    try {
      browser = await chromium.launch({
        headless: true
      });
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000
      });

      return {
        url: page.url(),
        title: await page.title(),
        html: await page.content()
      };
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        throw new ApplicationError(
          "VALIDATION_ERROR",
          "Crawl timed out while waiting for the page to finish loading",
          408
        );
      }

      if (error instanceof Error) {
        throw new ApplicationError(
          "VALIDATION_ERROR",
          `Unable to crawl URL: ${error.message}`,
          400
        );
      }

      throw new ApplicationError("INTERNAL_SERVER_ERROR", "Unable to crawl URL", 500);
    } finally {
      await browser?.close();
    }
  }
}
