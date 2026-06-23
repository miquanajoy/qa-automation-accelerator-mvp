import { z } from "zod";

export const updateProjectDto = z.object({
  id: z.string().trim().min(1, "Project id is required"),
  name: z.string().trim().min(1, "Project name is required").max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : null))
});

export type UpdateProjectDto = z.infer<typeof updateProjectDto>;
