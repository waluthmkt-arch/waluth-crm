
"use server";

import * as z from "zod";
import { signIn } from "@/auth";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/", // Redirect to dashboard after login
        });
    } catch (error) {
        // NextAuth throws error on redirect, so we need to re-throw it if it's the redirect error
        // In v5 beta, this is a known pattern.
        throw error;
    }
};
