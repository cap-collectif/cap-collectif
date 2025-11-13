import { AsyncSelect, Box, FormLabel } from '@cap-collectif/ui'
import { CarrouselSelectsQuery, CarrouselSelectsQuery$data } from '@relay/CarrouselSelectsQuery.graphql'
import { CarrouselElementType } from '@relay/SectionIdCarrouselQuery.graphql'
import stripHTML from '@shared/utils/stripHTML'
import { environment } from '@utils/relay-environement'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql } from 'react-relay'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import {
  getSelectLabel,
  MAX_DESC_LENGTH,
  MAX_HIGHLIGHTED_DESC_LENGTH,
  MAX_HIGHLIGHTED_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  PrefillEntity,
  SectionType,
} from './Carrousel.utils'

const QUERY = graphql`
  query CarrouselSelectsQuery(
    $term: String
    $isEvent: Boolean!
    $isProject: Boolean!
    $isTheme: Boolean!
    $isPost: Boolean!
  ) {
    viewer {
      posts(query: $term) @include(if: $isPost) {
        edges {
          node {
            value: id
            label: title
            description: body
            abstract
            url
            media {
              id
              type: contentType
              url(format: "reference")
            }
          }
        }
      }
      events(search: $term) @include(if: $isEvent) {
        edges {
          node {
            value: id
            label: title
            description: body
            url
            media {
              id
              type: contentType
              url(format: "reference")
            }
            startAt
            endAt
          }
        }
      }
    }

    projects(term: $term) @include(if: $isProject) {
      edges {
        node {
          value: id
          label: title
          description
          url
          media: cover {
            id
            type: contentType
            url(format: "reference")
          }
        }
      }
    }
    themes(title: $term) @include(if: $isTheme) {
      value: id
      label: title
      url
      description: body
      teaser
      media {
        id
        type: contentType
        url(format: "reference")
      }
    }
  }
` as GraphQLTaggedNode

const formatData = (data: CarrouselSelectsQuery$data, type: CarrouselElementType): PrefillEntity[] => {
  if (!data) return []
  if (type === 'PROJECT') return data.projects?.edges?.map(({ node }) => node)
  if (type === 'EVENT') return data.viewer?.events?.edges?.map(({ node }) => node)
  if (type === 'THEME')
    return data.themes?.map(t => ({ ...t, description: t?.teaser ?? t.description, teaser: undefined }))
  if (type === 'ARTICLE')
    return data.viewer?.posts?.edges.map(({ node: p }) => ({
      ...p,
      description: p?.abstract ?? p.description,
      abstract: undefined,
    }))

  return []
}

export const CarrouselSelects: FC<{ fieldBaseName: string; sectionType: SectionType }> = ({
  fieldBaseName,
  sectionType,
}) => {
  const intl = useIntl()
  const { watch, setValue } = useFormContext()
  const { type } = watch(fieldBaseName)

  if (type === 'CUSTOM') return null

  const label = getSelectLabel(type)

  const loadOptions = async (term: string): Promise<PrefillEntity[]> => {
    const data = await fetchQuery<CarrouselSelectsQuery>(environment, QUERY, {
      term,
      isEvent: type === 'EVENT',
      isProject: type === 'PROJECT',
      isTheme: type === 'THEME',
      isPost: type === 'ARTICLE',
    }).toPromise()

    if (data) {
      return formatData(data, type)
    }

    return []
  }

  return (
    <Box mb={4}>
      <FormLabel label={intl.formatMessage({ id: label })} mb={1} />
      {/** neat trick to tell the drag'n'drop lib to allow click inside */}
      <Box contentEditable suppressContentEditableWarning>
        <AsyncSelect
          autoFocus
          placeholder={intl.formatMessage({ id: 'section.search_title' })}
          loadOptions={loadOptions}
          defaultOptions
          loadingMessage={() => intl.formatMessage({ id: 'global.loading' })}
          noOptionsMessage={() => intl.formatMessage({ id: 'result-not-found' })}
          isClearable
          onChange={value => {
            if (value) {
              setValue(
                `${fieldBaseName}.title`,
                value.label?.slice(0, sectionType === 'carrousel' ? MAX_TITLE_LENGTH : MAX_HIGHLIGHTED_TITLE_LENGTH),
              )
              setValue(
                `${fieldBaseName}.description`,
                stripHTML(value.description)?.slice(
                  0,
                  sectionType === 'carrousel' ? MAX_DESC_LENGTH : MAX_HIGHLIGHTED_DESC_LENGTH,
                ),
              )
              setValue(`${fieldBaseName}.redirectLink`, value.url)
              setValue(`${fieldBaseName}.image`, value.media)
              setValue(`${fieldBaseName}.startAt`, type === 'EVENT' ? value.startAt : undefined)
              setValue(`${fieldBaseName}.endAt`, type === 'EVENT' ? value.endAt : undefined)
            }
          }}
          variantColor="hierarchy"
        />
      </Box>
    </Box>
  )
}

export default CarrouselSelects
