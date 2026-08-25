export type SocialNetworkRow = {
  id: string
  title: string
  link: string
  position: number
  isEnabled: boolean
  updatedAt?: string | null
  media?: {
    id: string
    name: string
    size: string
    type: string
    url: string
  } | null
}
