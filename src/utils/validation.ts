import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  password:  z.string().min(6),
  role:      z.enum(["pharmacy","chef","vendor","topvendor","rider"]), // partners only
  company:   z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});