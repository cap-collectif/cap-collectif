import { CapUIIcon } from '@cap-collectif/ui'

export const CONNECTION_NODES_PER_PAGE = 100

export type StyleOption = {
  label: string
  value: string
  icon: CapUIIcon
}

// Keep in sync with FooterSocialNetwork::$socialIcons in the backend (Capco\AppBundle\Entity\FooterSocialNetwork).
export const STYLE_OPTIONS: StyleOption[] = [
  { label: 'Site externe', value: 'link-1', icon: CapUIIcon.Link },
  { label: 'Facebook', value: 'facebook', icon: CapUIIcon.Facebook },
  { label: 'X', value: 'x', icon: CapUIIcon.X },
  { label: 'Linkedin', value: 'linkedin', icon: CapUIIcon.Linkedin },
  { label: 'Vimeo', value: 'vimeo', icon: CapUIIcon.Vimeo },
  { label: 'Instagram', value: 'instagram', icon: CapUIIcon.Instagram },
  { label: 'Youtube', value: 'youtube', icon: CapUIIcon.Youtube },
]

// Mirrors FooterAbout.tsx's getIconName, which renders these same style values in the public footer.
export const getStyleIcon = (style: string): CapUIIcon =>
  STYLE_OPTIONS.find(option => option.value === style)?.icon ?? CapUIIcon.Link
