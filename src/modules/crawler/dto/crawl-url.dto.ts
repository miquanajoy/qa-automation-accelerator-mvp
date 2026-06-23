import { z } from "zod";

export const crawlUrlDto = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine((value) => !/\s/.test(value), "URL cannot contain spaces")
});

export type CrawlUrlDto = z.infer<typeof crawlUrlDto>;
