import { z } from "zod";

const signUpFormSchema = z.object({
  email: z.string().min(2).max(64).email(),
  username: z.string().min(2).max(32),
  password: z.string().regex(RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")), // 1 uppercase, lowercase, number, special character
});

const signInFormSchema = z.object({
  email: z.string().min(2).max(64).email(),
  password: z.string(),
});

export { signUpFormSchema, signInFormSchema } 

