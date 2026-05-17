import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const envClientSchema = z.object({
  NEXT_PUBLIC_WALLET_CONNECT_ID: z.string().min(1),
  NEXT_PUBLIC_API_URI: z.string().min(1),
});

export const validateClientEnv = () => envClientSchema.safeParse(process.env);

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_WALLET_CONNECT_ID: z.string().min(1),
    NEXT_PUBLIC_API_URI: z.string().min(1),
  },
  server: {},
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    NEXT_PUBLIC_API_URI: process.env.NEXT_PUBLIC_API_URI,
  },
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    console.error("Client environment validation errors:", issues);
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "Invalid client environment variables"
        : "Continuing with missing client environment variables in development",
    );
  },
});
