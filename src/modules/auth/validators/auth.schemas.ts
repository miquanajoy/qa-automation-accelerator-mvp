import { z } from "zod";

const passwordSchema = z
  .string()
  .min(7, "Password must be at least 7 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  email: z.string().trim().email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: passwordSchema
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1)
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;
export type LoginSchemaInput = z.infer<typeof loginSchema>;
