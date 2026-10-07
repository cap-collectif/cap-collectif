import { FieldInput, FormControl, Select } from '@cap-collectif/form'
import { Box, Button, ButtonGroup, Flex, FormLabel } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import type { LegalSettingsFormQuery, LegalSettingsFormQuery$data } from '@relay/LegalSettingsFormQuery.graphql'
import UpdateLegalSettingMutation from '@mutations/UpdateLegalSettingMutation'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { formatCodeToLocale } from '@utils/locale-helper'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

export const QUERY = graphql`
  query LegalSettingsFormQuery {
    legalSettings {
      id
      keyname
      isEnabled
      translations {
        id
        locale
        value
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
  }
`

type AvailableLocale = LegalSettingsFormQuery$data['availableLocales'][number]

type FormValues = {
  isEnabled: boolean
  translations: Record<string, string>
}

type EditableLocale = {
  code: AvailableLocale['code']
  key: string
  label: string
}

const getDisplayedLocale = (
  availableLocales: ReadonlyArray<AvailableLocale>,
  viewerLocale: string,
  multilangue: boolean,
): AvailableLocale => {
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]

  if (!multilangue) return defaultLocale

  return availableLocales.find(locale => formatCodeToLocale(locale.code) === viewerLocale) ?? defaultLocale
}

const LegalSettingsForm: React.FC = () => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const { legalSettings, availableLocales } = useLazyLoadQuery<LegalSettingsFormQuery>(QUERY, {})
  const siteParameter = legalSettings.find(setting => setting.keyname === 'legal-mentions')
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  const defaultLocaleKey = formatCodeToLocale(defaultLocale.code)
  const displayedLocale = getDisplayedLocale(availableLocales, intl.locale, multilangue)
  // Without the multilangue feature only the platform default locale can be edited.
  const editableLocales: EditableLocale[] = (multilangue ? [...availableLocales] : [defaultLocale])
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(locale => ({
      code: locale.code,
      key: formatCodeToLocale(locale.code),
      label: intl.formatMessage({ id: locale.traductionKey }),
    }))
  const [currentLocale, setCurrentLocale] = React.useState(formatCodeToLocale(displayedLocale.code))
  const defaultValues: FormValues = {
    isEnabled: siteParameter?.isEnabled ?? false,
    translations: Object.fromEntries(
      editableLocales.map(locale => [
        locale.key,
        siteParameter?.translations?.find(translation => translation?.locale === locale.key)?.value ?? '',
      ]),
    ),
  }
  const form = useForm<FormValues>({ defaultValues })
  const { control, formState, handleSubmit } = form

  const onSubmit = async (values: FormValues) => {
    if (!siteParameter) return
    const translations = editableLocales
      .filter(locale => values.translations[locale.key] !== defaultValues.translations[locale.key])
      .map(locale => ({ locale: locale.code, value: values.translations[locale.key] }))

    try {
      const { updateLegalSetting } = await UpdateLegalSettingMutation.commit({
        input: { id: siteParameter.id, isEnabled: values.isEnabled, translations },
      })
      if (!updateLegalSetting || updateLegalSetting.errorCode) {
        throw new Error(updateLegalSetting?.errorCode ?? 'UNKNOWN_ERROR')
      }
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <FormProvider {...form}>
      <Box bg="white" p={6} borderRadius="8px">
        <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
          {multilangue && (
            <Flex mb={4}>
              <Select
                options={editableLocales.map(locale => ({ label: locale.label, value: locale.key }))}
                value={currentLocale}
                onChange={value => {
                  if (typeof value === 'string' && value) {
                    setCurrentLocale(value)
                  }
                }}
              />
            </Flex>
          )}
          {/* The key remounts the editor on locale change: Jodit only re-renders its content when its
              own language prop changes, so simply pointing it to another field would not be displayed. */}
          <FormControl name={`translations.${currentLocale}`} key={currentLocale} control={control}>
            <TextEditor
              label={intl.formatMessage({ id: 'global.value' })}
              name={`translations.${currentLocale}`}
              noModalAdvancedEditor
              platformLanguage={defaultLocaleKey}
              selectedLanguage={defaultLocaleKey}
            />
          </FormControl>
          <FormControl name="isEnabled" control={control}>
            <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
            <FieldInput type="switch" control={control} name="isEnabled" id="isEnabled" />
          </FormControl>
          <Flex justify="flex-end" mt={6}>
            <ButtonGroup>
              <Button
                type="submit"
                form={formId}
                variant="primary"
                variantColor="primary"
                variantSize="medium"
                isLoading={formState.isSubmitting}
              >
                {intl.formatMessage({ id: 'global.save' })}
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
      </Box>
    </FormProvider>
  )
}

export default LegalSettingsForm
