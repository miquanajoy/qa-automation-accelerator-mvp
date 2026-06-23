import { z } from "zod";

export const createProjectDto = z.object({
  name: z.string().trim().min(1, "Project name is required").max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : null))
});

export type CreateProjectDto = z.infer<typeof createProjectDto>;
