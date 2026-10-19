import type { ThemeStatus } from '@relay/ThemeItem_theme.graphql'

export const CONNECTION_NODES_PER_PAGE = 20

export const THEME_STATUS_LABELS: Record<Exclude<ThemeStatus, '%future added value'>, string> = {
  CLOSED: 'theme.show.status.closed',
  OPENED: 'theme.show.status.opened',
  FUTURE: 'theme.show.status.future',
}
