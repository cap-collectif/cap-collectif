// eslint-disable-next-line import/no-unresolved
import 'server-only'
import { GraphQLTaggedNode } from 'relay-runtime'
import { cookies } from 'next/headers'
import { Locale } from 'types'
import Fetcher from '@utils/fetch'
import { formatCookiesForServer } from '@shared/utils/cookies'
import { getRequestLocale } from './request-locale'

type SsrGraphqlWithLocaleOptions = {
  cache?: RequestCache
  locale?: Locale
}

export const ssrGraphqlWithLocale = <T, U = any>(
  request: GraphQLTaggedNode,
  variables?: U,
  options: SsrGraphqlWithLocaleOptions = {},
): Promise<T> => {
  const locale = options.locale ?? getRequestLocale()
  const cookieStore = cookies()
  const cookieHeader = formatCookiesForServer(cookieStore, { locale })

  return Fetcher.ssrGraphql<T, U>(request, variables, cookieHeader, options.cache ?? 'no-store', locale)
}
