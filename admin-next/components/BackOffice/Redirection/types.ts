import type { ReactNode } from 'react'

export type RedirectDuration = 'TEMPORARY' | 'PERMANENT'
export type RedirectType = 'REDIRECTION' | 'URL_SHORTENING'

export type RedirectRow = {
  id: string
  sourceUrl: string
  destinationUrl: string
  duration: RedirectDuration
  redirectType: RedirectType
}

export type AddRedirectFormValues = {
  originalUrl: string
  destinationUrl: string
  duration: RedirectDuration
}

export type ShortenUrlFormValues = {
  longUrl: string
  shortUrl: string
}

export type RedirectModalProps = {
  connectionId?: string | null
  usedSourceUrls: Set<string>
  allowedSourceHosts: string[]
  sourceUrlOrigin?: string
  editingRedirect?: RedirectRow
  disclosure?: ReactNode
}
