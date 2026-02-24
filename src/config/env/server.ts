import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export enum ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  TEST = "test",
}

const envServerSchema = z.object({
  APP_ENV: z.enum(ENV).optional().default(ENV.DEVELOPMENT),
  GITHUB_TOKEN: z.string().min(1),
  ASSETS_REPO_SLUG: z.string().min(1),
});

export const validateServerEnv = () => envServerSchema.safeParse(process.env);

export const serverEnv = createEnv({
  client: {},
  server: {
    APP_ENV: z.enum(ENV).optional().default(ENV.DEVELOPMENT),
    GITHUB_TOKEN: z.string().min(1),
    ASSETS_REPO_SLUG: z.string().min(1),
  },
  experimental__runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    ASSETS_REPO_SLUG: process.env.ASSETS_REPO_SLUG,
  },
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    console.error("Server environment validation errors:", issues);
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "Invalid server environment variables"
        : "Continuing with missing server environment variables in development",
    );
  },
});
