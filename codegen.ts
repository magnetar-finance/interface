import { serverEnv, validateServerEnv } from './src/config/env/server';
import type { CodegenConfig } from '@graphql-codegen/cli';

const SERVER_ENV = validateServerEnv();

const config: CodegenConfig = {
  schema: SERVER_ENV.data?.GQL_URI || serverEnv.GQL_URI,
  documents: ['./src/gql/queries/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/codegen/': {
      preset: 'client',
      config: {
        enumsAsTypes: true,
      },
    },
    './src/gql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
