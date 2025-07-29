import * as React from 'react'
import { Accordion, FormLabel } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { Locale } from '@components/BackOffice/Posts/Post.type'

type Props = {
  availableLocales: Locale[]
  setCurrentLocale: (value: string) => void
}

const MultilangueSidePanel: React.FC<Props> = ({ availableLocales, setCurrentLocale }) => {
  const intl = useIntl()
  const { control, setValue } = useFormContext()
  const multilangue = useFeatureFlag('multilangue')

  if (!multilangue) return null

  return (
    <>
      <Accordion.Button>
        {intl.formatMessage({
          id: 'capco.module.multilangue',
        })}
      </Accordion.Button>
      <Accordion.Panel>
        <FormControl name="currentLocale" control={control} key="currentLocale">
          <FormLabel htmlFor="currentLocale" label={intl.formatMessage({ id: 'admin.post.languages' })} />
          <FieldInput
            type="select"
            name="currentLocale"
            control={control}
            options={
              availableLocales
                ? availableLocales.map(locale => ({
                    value: locale.code,
                    label: intl.formatMessage({ id: locale.traductionKey }),
                  }))
                : []
            }
            id="currentLocale"
            onChange={e => {
              setValue('currentLocale', e)
              setCurrentLocale(e)
            }}
          />
        </FormControl>
      </Accordion.Panel>
    </>
  )
}

export default MultilangueSidePanel
