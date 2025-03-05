import { FieldInput, FormControl } from '@cap-collectif/form'
import { Flex, FormLabel, Heading, Link } from '@cap-collectif/ui'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { SectionType } from './Carrousel.utils'

export const SECTION_TITLE_MAX_LENGTH = 20

export const CarrouselParameters: FC<{ type: SectionType }> = ({ type }) => {
  const intl = useIntl()
  const { control } = useFormContext()
  return (
    <Flex direction="column" spacing={6} width="30%">
      <Flex p={6} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion" position="relative">
        <Flex color="blue.500" position="absolute" right={6} top={6}>
          <Link
            href="/"
            target="_blank"
            ml={1}
            fontWeight={600}
            sx={{
              textDecoration: 'none !important',
            }}
          >
            {intl.formatMessage({ id: 'global.preview' })}
          </Link>
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
              type="number"
              name="position"
              control={control}
              min={1}
              step="1"
              rules={{
                validate: value =>
                  (Number.isInteger(value) && value > 0) || intl.formatMessage({ id: 'must-be-positive-integer' }),
              }}
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
              sx={{ label: { justifyContent: 'space-between', span: { flex: '1' } } }}
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
