import { SectionIdCarrouselQuery$data } from '@relay/SectionIdCarrouselQuery.graphql'
import { CarrouselElementType } from '@relay/SectionIdCarrouselQuery.graphql'
import { SECTION_TITLE_MAX_LENGTH } from './CarrouselParameters'

export type FormValues = {
  position: number
  enabled: boolean
  isLegendEnabledOnImage: boolean
  preventReSubmit?: boolean
  title?: string
  carrouselElements: Array<{
    id?: string
    title: string
    description: string
    buttonLabel: string
    redirectLink: string
    image: { id: string; url: string }
    type: CarrouselElementType
    isDisplayed: boolean
    defaultIsOpen?: boolean
    extraData?: { startAt: string; endAt?: string }
  }>
}

export type PrefillEntity = {
  readonly description: string | null
  readonly label: string
  readonly media: {
    readonly type: string
    readonly url: string | null
  } | null
  readonly url: string | null
  readonly value: string
}

export type SectionType = 'carrousel' | 'carrouselHighlighted'

export const isValid = (value: FormValues, type: SectionType) => {
  if (type === 'carrouselHighlighted' && (!value.title || value.title?.length > SECTION_TITLE_MAX_LENGTH)) return false
  if (value.preventReSubmit || !value.position || !Number.isInteger(value.position) || value.position < 1) return false
  if (
    value.carrouselElements.every(element => {
      return (
        element.title &&
        ((element.buttonLabel && element.redirectLink) || element.type !== 'CUSTOM') &&
        (element.image || type === 'carrouselHighlighted')
      )
    })
  )
    return true
  return false
}

export const getSelectLabel = (type: CarrouselElementType) => {
  switch (type) {
    case 'EVENT':
      return 'section.select_event'
    case 'PROJECT':
      return 'select-a-participatory-project'
    case 'THEME':
      return 'section.select_theme'
    case 'ARTICLE':
    default:
      return 'section.select_article'
  }
}

export const getCardLabel = (type: CarrouselElementType) => {
  switch (type) {
    case 'EVENT':
      return 'type-event'
    case 'PROJECT':
      return 'global.project'
    case 'THEME':
      return 'global.theme'
    case 'ARTICLE':
      return 'global.post'
    case 'CUSTOM':
    default:
      return 'customized'
  }
}

export const getInitialValues = (
  carrouselConfiguration: SectionIdCarrouselQuery$data['carrouselConfiguration'],
  newItemId?: string | null,
) => {
  return {
    ...carrouselConfiguration,
    carrouselElements:
      carrouselConfiguration.carrouselElements?.edges
        ?.map(({ node }) => ({
          ...node,
          defaultIsOpen: node.id === newItemId || undefined,
        }))
        .sort((item1, item2) => (item1.position > item2.position ? 1 : -1)) || [],
    preventReSubmit: newItemId !== undefined,
  }
}

export const MAX_TITLE_LENGTH = 50
export const MAX_HIGHLIGHTED_TITLE_LENGTH = 55
export const MAX_DESC_LENGTH = 165
export const MAX_HIGHLIGHTED_DESC_LENGTH = 220
export const MAX_LABEL_LENGTH = 20
