import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, Flex, FormLabel, Heading } from '@cap-collectif/ui'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { SectionType } from './Carrousel.utils'
import * as React from 'react'
import { useFragment, graphql } from 'react-relay'
import { CarrouselParameters_query$key } from '@relay/CarrouselParameters_query.graphql'

export const SECTION_TITLE_MAX_LENGTH = 11


const QUERY_FRAGMENT = graphql`
  fragment CarrouselParameters_query on Query {
    homePageSections(enabled: null) {
      totalCount
    }
  }
`

export const CarrouselParameters: FC<{ type: SectionType, query: CarrouselParameters_query$key }> = ({ type, query: queryRef }) => {
  const intl = useIntl()
  const { control } = useFormContext()
  const query = useFragment(QUERY_FRAGMENT, queryRef)

  const positionOptions = Array.from({ length: query.homePageSections.totalCount }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }))

  return (
    <Flex direction="column" spacing={6} width="30%">
      <Flex p={6} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion" position="relative">
        <Flex color="blue.500" position="absolute" right={6} top={6}>
          <Button
            href="/"
            target="_blank"
            ml={1}
            fontWeight={600}
            as="a"
          >
            {intl.formatMessage({ id: 'global.preview' })}
          </Button>
        </Flex>
        <Heading as="h4" color="blue.800" fontWeight="600">
          {intl.formatMessage({ id: 'global-customization' })}
        </Heading>
        <div>
          {type === 'carrouselHighlighted' ? (
            <FormControl name="title" control={control} isRequired>
              <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
              <FieldInput
                name="title"
                control={control}
                type="text"
                placeholder={intl.formatMessage({
                  id: 'admin.label.highlighted',
                })}
                maxLength={SECTION_TITLE_MAX_LENGTH}
              />
            </FormControl>
          ) : null}
          <FormControl name="position" control={control} isRequired>
            <FormLabel label={intl.formatMessage({ id: 'section-admin-display-order' })} />
            <FieldInput
              type="select"
              control={control}
              name="position"
              options={positionOptions}
            />
          </FormControl>
          <FormControl
            name="enabled"
            control={control}
            sx={{ label: { justifyContent: type === 'carrousel' ? 'space-between' : 'left' } }}
          >
            <FieldInput id="enabled" type="switch" name="enabled" control={control} direction="row-reverse">
              {intl.formatMessage({ id: 'section.activate' })}
            </FieldInput>
          </FormControl>
          {type === 'carrousel' ? (
            <FormControl
              name="isLegendEnabledOnImage"
              control={control}
              sx={{ label: { justifyContent: 'space-between' } }}
            >
              <FieldInput
                id="isLegendEnabledOnImage"
                type="switch"
                name="isLegendEnabledOnImage"
                control={control}
                direction="row-reverse"
              >
                {intl.formatMessage({ id: 'section.display_legend_on_picture' })}
              </FieldInput>
            </FormControl>
          ) : null}
        </div>
      </Flex>
    </Flex>
  )
}

export default CarrouselParameters
