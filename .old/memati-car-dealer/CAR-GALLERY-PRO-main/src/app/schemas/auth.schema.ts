import z from "zod";

export const SignInSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const OTPSchema = z.object({
  code: z
    .string().length(6, "OTP code must be exactly 6 characters long")
    .regex(/^\d+$/, "OTP code must contain only digits"),
})

export type OTPSchemaType = z.infer<typeof OTPSchema>;