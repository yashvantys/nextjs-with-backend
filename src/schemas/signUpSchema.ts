import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(2, "User Name must be atleast 2 characters")
  .max(20, "User Name not more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "User Name not contains special charactors");

export const signUpSchema = z.object({
  userName: userNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" }),
});
