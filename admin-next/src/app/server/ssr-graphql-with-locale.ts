// eslint-disable-next-line import/no-unresolved
import 'server-only'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { GraphQLTaggedNode } from 'relay-runtime'
import { cookies, headers } from 'next/headers'
import nodeFetch from 'node-fetch'
import { Locale } from 'types'
import { createHeaders } from '@utils/fetch'
import { formatCookiesForServer } from '@shared/utils/cookies'
import { getRequestLocale } from './request-locale'

type SsrGraphqlWithLocaleOptions = {
  locale?: Locale
}

export const ssrGraphqlWithLocale = async <T, U = any>(
  request: GraphQLTaggedNode,
  variables?: U,
  options: SsrGraphqlWithLocaleOptions = {},
): Promise<T> => {
  const locale = options.locale ?? getRequestLocale()
  const cookieStore = cookies()
  const cookieHeader = formatCookiesForServer(cookieStore, { locale })
  const host = headers().get('host')
  const env = process.env.NEXT_PUBLIC_SYMFONY_ENV || process.env.SYMFONY_ENV
  const endpoint = env === 'prod' ? 'http://127.0.0.1/graphql/internal' : 'http://application:8080/graphql/internal'
  const response = await nodeFetch(`${endpoint}?tl=${encodeURIComponent(locale)}`, {
    method: 'POST',
    headers: createHeaders({
      Cookie: cookieHeader,
      ...(host ? { Host: host } : {}),
    }),
    body: JSON.stringify({ query: print(gql((request as any)?.default?.params?.text)), variables }),
  })

  if (!response.ok) throw new Error(response.statusText)

  return (await response.json()).data
}
