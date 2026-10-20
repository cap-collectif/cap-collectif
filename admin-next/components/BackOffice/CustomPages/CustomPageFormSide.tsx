import { FieldInput, FormControl, Select } from '@cap-collectif/form'
import {
  Accordion,
  CapInputSize,
  CapUIAccordionSize,
  CapUIFontSize,
  FormGuideline,
  FormLabel,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { Locale } from './CustomPage.type'

type Props = {
  availableLocales: Locale[]
  currentLocale: string
  setCurrentLocale: (value: string) => void
}

const CustomPageFormSide: React.FC<Props> = ({ availableLocales, currentLocale, setCurrentLocale }) => {
  const intl = useIntl()
  const { control } = useFormContext()
  const multilangue = useFeatureFlag('multilangue')

  return (
    <Accordion
      allowMultiple
      size={CapUIAccordionSize.md}
      sx={{ '.cap-accordion__button p': { fontWeight: 600 } }}
      defaultAccordion={multilangue ? ['multilingual'] : []}
      color="white"
    >
      {multilangue && (
        <Accordion.Item id="multilingual">
          <Accordion.Button>{intl.formatMessage({ id: 'capco.module.multilangue' })}</Accordion.Button>
          <Accordion.Panel>
            <FormLabel label={intl.formatMessage({ id: 'global-languages' })} />
            <Select
              options={availableLocales.map(locale => ({
                value: locale.code,
                label: intl.formatMessage({ id: locale.traductionKey }),
              }))}
              value={currentLocale}
              onChange={value => {
                if (value) setCurrentLocale(String(value))
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
      )}

      <Accordion.Item id="advanced">
        <Accordion.Button>{intl.formatMessage({ id: 'admin.fields.page.advanced' })}</Accordion.Button>
        <Accordion.Panel>
          <FormControl
            name={`${currentLocale}-metaDescription`}
            key={`${currentLocale}-metaDescription`}
            control={control}
          >
            <FormLabel
              htmlFor={`${currentLocale}-metaDescription`}
              label={intl.formatMessage({ id: 'global.meta.description' })}
            >
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FormGuideline>{intl.formatMessage({ id: 'admin.help.metadescription' })}</FormGuideline>
            <FieldInput
              type="textarea"
              id={`${currentLocale}-metaDescription`}
              name={`${currentLocale}-metaDescription`}
              control={control}
              variantSize={CapInputSize.Sm}
            />
          </FormControl>

          <FormControl name="cover" control={control} width="100%">
            <FormLabel htmlFor="cover" label={intl.formatMessage({ id: 'global.image' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FormGuideline>
              {intl.formatMessage({ id: 'admin.help.social_network_thumbnail' })}{' '}
              {intl.formatMessage({ id: 'supported.format.listed' }, { format: 'jpg, png' })}
              {intl.formatMessage({ id: 'specific-max-weight' }, { weight: '8Mo' })}
            </FormGuideline>
            <FieldInput
              type="uploader"
              name="cover"
              id="cover"
              control={control}
              format=".jpg,.jpeg,.png"
              maxSize={8000000}
              size={UPLOADER_SIZE.SM}
              uploadURI={UPLOAD_PATH}
              showThumbnail
              isFullWidth
            />
          </FormControl>

          <FormControl name="customCode" control={control}>
            <FormLabel htmlFor="customCode" label={intl.formatMessage({ id: 'admin.customcode' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FormGuideline>{intl.formatMessage({ id: 'admin.help.customcode' })}</FormGuideline>
            <FieldInput
              type="textarea"
              id="customCode"
              name="customCode"
              control={control}
              rows={10}
              placeholder={intl.formatMessage({ id: 'admin.customcode.placeholder' })}
            />
          </FormControl>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default CustomPageFormSide
