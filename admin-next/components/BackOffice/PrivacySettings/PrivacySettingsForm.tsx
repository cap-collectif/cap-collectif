import { FieldInput, FormControl, Select } from '@cap-collectif/form'
import { Box, Button, ButtonGroup, Flex, FormLabel } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import type { PrivacySettingsFormQuery, PrivacySettingsFormQuery$data } from '@relay/PrivacySettingsFormQuery.graphql'
import UpdatePrivacySettingMutation from '@mutations/UpdatePrivacySettingMutation'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { formatCodeToLocale } from '@utils/locale-helper'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

export const QUERY = graphql`
  query PrivacySettingsFormQuery {
    privacySettings {
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

type AvailableLocale = PrivacySettingsFormQuery$data['availableLocales'][number]

type FormValues = {
  isEnabled: boolean
  translations: Record<string, string>
}

type EditableLocale = {
  // `FR_FR`: the TranslationLocale enum value expected by the mutation.
  code: AvailableLocale['code']
  // `fr-FR`: the code stored on the translations, also used as form key.
  key: string
  label: string
}

const PrivacySettingsForm: React.FC = () => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const { privacySettings, availableLocales } = useLazyLoadQuery<PrivacySettingsFormQuery>(QUERY, {})
  const siteParameter = privacySettings.find(setting => setting.keyname === 'privacy-policy')

  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  const defaultLocaleKey = formatCodeToLocale(defaultLocale.code)
  // Without the multilangue feature only the platform default locale can be edited.
  const editableLocales: EditableLocale[] = (multilangue ? [...availableLocales] : [defaultLocale])
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(locale => ({
      code: locale.code,
      key: formatCodeToLocale(locale.code),
      label: intl.formatMessage({ id: locale.traductionKey }),
    }))
  // Opens on the admin interface locale when it can be edited, on the platform default locale otherwise.
  const [currentLocale, setCurrentLocale] = React.useState(
    editableLocales.find(locale => locale.key === intl.locale)?.key ?? defaultLocaleKey,
  )

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
    // Only the locales whose text changed are sent, the backend leaves the other ones untouched.
    const translations = editableLocales
      .filter(locale => {
        const initialValue = defaultValues.translations[locale.key] ?? ''
        const newValue = values.translations[locale.key] ?? ''
        if (newValue === initialValue) return false
        // Rich text editors normalize an empty content to markup like "<p><br></p>"
        return !(isWYSIWYGContentEmpty(initialValue) && isWYSIWYGContentEmpty(newValue))
      })
      .map(locale => ({ locale: locale.code, value: values.translations[locale.key] ?? '' }))

    try {
      const { updatePrivacySetting } = await UpdatePrivacySettingMutation.commit({
        input: { id: siteParameter.id, isEnabled: values.isEnabled, translations },
      })
      if (!updatePrivacySetting || updatePrivacySetting.errorCode) {
        throw new Error(updatePrivacySetting?.errorCode ?? 'UNKNOWN_ERROR')
      }
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  if (!siteParameter) return null

  return (
    <FormProvider {...form}>
      <Box bg="white" p={6} borderRadius="8px">
        <Flex as="form" id={formId} direction="column" onSubmit={handleSubmit(onSubmit)}>
          {multilangue && (
            <Flex mb={4}>
              <Select
                aria-label={intl.formatMessage({ id: 'global-languages' })}
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
          {/* Jodit only re-renders its content when `selectedLanguage` changes; the `key` also remounts the
              editor on locale change so that no state of the previous locale leaks into the new one. */}
          <FormControl name={`translations.${currentLocale}`} key={currentLocale} control={control}>
            <TextEditor
              label={intl.formatMessage({ id: 'global.value' })}
              name={`translations.${currentLocale}`}
              noModalAdvancedEditor
              platformLanguage={defaultLocaleKey}
              selectedLanguage={currentLocale}
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

export default PrivacySettingsForm
