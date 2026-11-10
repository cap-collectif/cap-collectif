// Splits plain text into text and link tokens so that URLs and emails typed by participants can be rendered as links.
// Detection is delegated to linkify-it with the full list of top-level domains, as the former react-linkify library did:
// "http(s)://", "ftp://", "mailto:" and "//" links, bare domains such as "example.com" (linked with "http://")
// and emails (linked with "mailto:").
import { LinkifyIt } from 'linkify-it'
import tlds from 'tlds'

export type LinkifyToken = { type: 'text'; value: string } | { type: 'link'; value: string; href: string }

// Bare domains and "user:password@" credentials are detected by default by the linkify-it 2 used by react-linkify,
// but must be enabled explicitly since linkify-it 6
const linkifyIt = new LinkifyIt({ fuzzyLink: true, urlAuth: true, tlds })

export const linkify = (text: string): LinkifyToken[] => {
  const tokens: LinkifyToken[] = []
  let textStart = 0

  for (const match of linkifyIt.match(text) ?? []) {
    if (match.index > textStart) tokens.push({ type: 'text', value: text.slice(textStart, match.index) })
    tokens.push({ type: 'link', value: match.text, href: match.url })
    textStart = match.lastIndex
  }

  if (textStart < text.length) tokens.push({ type: 'text', value: text.slice(textStart) })

  return tokens
}

export default linkify
