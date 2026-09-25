import { FieldInput, FormControl, Select } from '@cap-collectif/form'
import { Box, Button, ButtonGroup, Flex, FormLabel, Modal } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import UpdateLoginSettingMutation from '@mutations/UpdateLoginSettingMutation'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { formatCodeToLocale } from '@utils/locale-helper'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import type { AvailableLocale, SiteParameter } from './LoginSettingModal'

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

type Props = {
  siteParameter: SiteParameter
  availableLocales: ReadonlyArray<AvailableLocale>
  hide: () => void
}

const LoginSettingForm: React.FC<Props> = ({ siteParameter, availableLocales, hide }) => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')

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
  const [currentLocale, setCurrentLocale] = React.useState(defaultLocaleKey)

  const defaultValues: FormValues = {
    isEnabled: siteParameter.isEnabled,
    translations: Object.fromEntries(
      editableLocales.map(locale => [
        locale.key,
        siteParameter.translations?.find(translation => translation?.locale === locale.key)?.value ?? '',
      ]),
    ),
  }
  const form = useForm<FormValues>({ defaultValues })
  const { control, formState, handleSubmit } = form

  const onSubmit = async (values: FormValues) => {
    // Only the locales whose text changed are sent, the backend leaves the other ones untouched.
    const translations = editableLocales
      .filter(locale => values.translations[locale.key] !== defaultValues.translations[locale.key])
      .map(locale => ({ locale: locale.code, value: values.translations[locale.key] }))

    try {
      const { updateLoginSetting } = await UpdateLoginSettingMutation.commit({
        input: { id: siteParameter.id, isEnabled: values.isEnabled, translations },
      })
      if (!updateLoginSetting || updateLoginSetting.errorCode) {
        throw new Error(updateLoginSetting?.errorCode ?? 'UNKNOWN_ERROR')
      }
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      hide()
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <FormProvider {...form}>
      <Modal.Body direction="column">
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
          {/* The `key` remounts the editor on locale change: Jodit only re-renders its content when its
              own language prop changes, so simply pointing it to another field would not be displayed. */}
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
        </Flex>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <ButtonGroup>
          <Button variant="secondary" variantColor="hierarchy" variantSize="medium" onClick={hide}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
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
      </Modal.Footer>
    </FormProvider>
  )
}

export default LoginSettingForm
