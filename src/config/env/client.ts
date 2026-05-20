import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const envClientSchema = z.object({
  NEXT_PUBLIC_WALLET_CONNECT_ID: z.string().min(1),
  NEXT_PUBLIC_API_URI: z.string().min(1),
  NEXT_PUBLIC_GQL_URI: z
    .string()
    .optional()
    .default(
      'https://api.goldsky.com/api/public/project_clws3jv71bgap01u93r59ccbm/subgraphs/magnetar-arc/1.0.6/gn',
    ),
});

export const validateClientEnv = () => envClientSchema.safeParse(process.env);

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_WALLET_CONNECT_ID: z.string().min(1),
    NEXT_PUBLIC_API_URI: z.string().min(1),
    NEXT_PUBLIC_GQL_URI: z
      .string()
      .optional()
      .default(
        'https://api.goldsky.com/api/public/project_clws3jv71bgap01u93r59ccbm/subgraphs/magnetar-arc/1.0.6/gn',
      ),
  },
  server: {},
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    NEXT_PUBLIC_API_URI: process.env.NEXT_PUBLIC_API_URI,
    NEXT_PUBLIC_GQL_URI: process.env.NEXT_PUBLIC_GQL_URI,
  },
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    console.error('Client environment validation errors:', issues);
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'Invalid client environment variables'
        : 'Continuing with missing client environment variables in development',
    );
  },
});
