import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export enum ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

const envServerSchema = z.object({
  APP_ENV: z.enum(ENV).optional().default(ENV.DEVELOPMENT),
  GITHUB_TOKEN: z.string().min(1).default(''),
  ASSETS_REPO_SLUG: z.string().min(1).default('assets/src/{chainId}/ERC20/index.json'),
  GQL_URI: z
    .string()
    .optional()
    .default(
      'https://api.goldsky.com/api/public/project_clws3jv71bgap01u93r59ccbm/subgraphs/magnetar-arc/1.0.6/gn',
    ),
});

export const validateServerEnv = () => envServerSchema.safeParse(process.env);

export const serverEnv = createEnv({
  client: {},
  server: {
    APP_ENV: z.enum(ENV).optional().default(ENV.DEVELOPMENT),
    GITHUB_TOKEN: z.string().default(''),
    ASSETS_REPO_SLUG: z.string().min(1).default('assets/src/{chainId}/ERC20/index.json'),
    GQL_URI: z
      .string()
      .optional()
      .default(
        'https://api.goldsky.com/api/public/project_clws3jv71bgap01u93r59ccbm/subgraphs/magnetar-arc/1.0.6/gn',
      ),
  },
  experimental__runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    ASSETS_REPO_SLUG: process.env.ASSETS_REPO_SLUG,
    GQL_URI: process.env.GQL_URI,
  },
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    console.error('Server environment validation errors:', issues);
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'Invalid server environment variables'
        : 'Continuing with missing server environment variables in development',
    );
  },
});
