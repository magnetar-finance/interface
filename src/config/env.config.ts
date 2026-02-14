import { z } from "zod";

export enum ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  TEST = "test",
}

const envSchema = z.object({
  APP_ENV: z.enum(ENV).optional().default(ENV.DEVELOPMENT),
  API_URI: z.url(),
  GITHUB_TOKEN: z.string(),
  ASSETS_REPO_SLUG: z.string(),
});

export type ENVType = z.infer<typeof envSchema>;

export const validateEnv = () => envSchema.safeParse(process.env);

export function getEnv() {
  const { data, error } = validateEnv();
  if (!error && data) {
    return data;
  }
  return {} as ENVType;
}
