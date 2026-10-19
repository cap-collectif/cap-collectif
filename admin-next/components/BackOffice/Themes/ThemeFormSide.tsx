import { FieldInput, FormControl, Select } from '@cap-collectif/form'
import { Accordion, CapInputSize, CapUIAccordionSize, FormLabel } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { Locale, NO_STATUS, ThemeFormValues } from './Theme.type'
import { THEME_STATUS_LABELS } from './utils'

type ThemeFormSideProps = {
  availableLocales: Locale[]
  currentLocale: string
  setCurrentLocale: (value: string) => void
}

const ThemeFormSide: React.FC<ThemeFormSideProps> = ({ availableLocales, currentLocale, setCurrentLocale }) => {
  const intl = useIntl()
  const { control } = useFormContext<ThemeFormValues>()
  const multilangue = useFeatureFlag('multilangue')
  const metaDescriptionField = `${currentLocale}-metaDescription`

  const statusOptions = [
    { value: NO_STATUS, label: intl.formatMessage({ id: 'global.no_status' }) },
    ...Object.entries(THEME_STATUS_LABELS).map(([value, label]) => ({
      value,
      label: intl.formatMessage({ id: label }),
    })),
  ]

  return (
    <Accordion
      allowMultiple
      size={CapUIAccordionSize.md}
      sx={{ '.cap-accordion__button p': { fontWeight: 600 } }}
      defaultAccordion={['publication']}
      color="white"
    >
      <Accordion.Item id="publication">
        <Accordion.Button>{intl.formatMessage({ id: 'global.publication' })}</Accordion.Button>
        <Accordion.Panel>
          <FormControl name="isEnabled" control={control}>
            <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
            <FieldInput type="switch" name="isEnabled" control={control} id="isEnabled" />
          </FormControl>

          <FormControl name="position" control={control} isRequired>
            <FormLabel htmlFor="position" label={intl.formatMessage({ id: 'global.position' })} />
            <FieldInput type="number" id="position" name="position" control={control} />
          </FormControl>

          <FormControl name="status" control={control}>
            <FormLabel htmlFor="status" label={intl.formatMessage({ id: 'global.status' })} />
            <FieldInput type="select" id="status" name="status" control={control} options={statusOptions} />
          </FormControl>
        </Accordion.Panel>
      </Accordion.Item>

      {multilangue && (
        <Accordion.Item id="multilingual">
          <Accordion.Button>{intl.formatMessage({ id: 'capco.module.multilangue' })}</Accordion.Button>
          <Accordion.Panel>
            <FormLabel label={intl.formatMessage({ id: 'global-languages' })} />
            {/* Display state of the page, not a submitted value: driven by hand, outside react-hook-form */}
            <Select
              options={availableLocales.map(locale => ({
                value: locale.code,
                label: intl.formatMessage({ id: locale.traductionKey }),
              }))}
              value={currentLocale}
              onChange={value => {
                const locale = availableLocales.find(({ code }) => code === value)
                if (locale) setCurrentLocale(locale.code)
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
      )}

      <Accordion.Item id="advanced">
        <Accordion.Button>{intl.formatMessage({ id: 'admin.fields.page.advanced' })}</Accordion.Button>
        <Accordion.Panel>
          <FormControl name={metaDescriptionField} key={metaDescriptionField} control={control}>
            <FormLabel htmlFor={metaDescriptionField} label={intl.formatMessage({ id: 'global.meta.description' })} />
            <FieldInput
              type="textarea"
              id={metaDescriptionField}
              name={metaDescriptionField}
              control={control}
              variantSize={CapInputSize.Sm}
            />
          </FormControl>
          <FormControl name="customCode" control={control}>
            <FormLabel htmlFor="customCode" label={intl.formatMessage({ id: 'admin.customcode' })} />
            <FieldInput
              type="textarea"
              id="customCode"
              name="customCode"
              control={control}
              placeholder={intl.formatMessage({ id: 'admin.customcode.placeholder' })}
            />
          </FormControl>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThemeFormSide
