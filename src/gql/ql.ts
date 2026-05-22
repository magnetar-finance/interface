import axios from 'axios';
import { type ExecutionResult, print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { clientEnv, validateClientEnv } from '@/config/env/client';

const defaultGqlUrl =
  validateClientEnv().data?.NEXT_PUBLIC_GQL_URI || clientEnv.NEXT_PUBLIC_GQL_URI;

export async function ql<R, V>(
  url: string = defaultGqlUrl,
  query: TypedDocumentNode<R, V>,
  ...[variables]: V extends Record<string, never> ? [] : [V]
) {
  const response = await axios.post(
    url,
    { query: print(query), variables },
    { headers: { Accept: 'application/graphql-response+json' } },
  );
  return response.data as ExecutionResult<R>;
}

export default ql;
