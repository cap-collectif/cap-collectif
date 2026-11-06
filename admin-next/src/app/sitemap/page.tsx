import { headers } from 'next/headers'
import { getEnv } from 'config'
import { messages } from '@utils/withPageAuthRequired'
import { Locale } from 'types'
import { getRequestLocale } from '../server/request-locale'
import Sitemap from './Sitemap'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  const locale = getRequestLocale()
  const translations = getEnv(headers().get('host')) === 'test' ? {} : messages[locale] || messages[Locale.frFR]
  return { title: translations['sitemap.title'] || 'sitemap.title' }
}

export default function SitemapPage() {
  return (
    <main id="main" tabIndex={-1}>
      <Sitemap />
    </main>
  )
}
