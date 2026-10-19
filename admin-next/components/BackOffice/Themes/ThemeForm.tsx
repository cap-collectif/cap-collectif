import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, CapUIFontSize, Flex, FormLabel, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { UserListField } from '@components/BackOffice/Form/UserListField'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { FieldErrors, useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import DeleteThemeConfirmationModal from './DeleteThemeConfirmationModal'
import { ThemeFormValues } from './Theme.type'

type ThemeFormProps = {
  isNewTheme: boolean
  themeId: string | null
  onSubmit: (data: ThemeFormValues) => void
  isLoading: boolean
  currentLocale: string
  defaultLocale: string
  setCurrentLocale: (locale: string) => void
}

// Translated fields are named `${locale}-${field}`, e.g. "FR_FR-title"
const getFieldLocale = (fieldName: string): string | null => fieldName.match(/^([A-Z]{2}_[A-Z]{2})-/)?.[1] ?? null

const ThemeForm = ({
  isNewTheme,
  themeId,
  onSubmit,
  isLoading,
  currentLocale,
  defaultLocale,
  setCurrentLocale,
}: ThemeFormProps): JSX.Element => {
  const intl = useIntl()
  const {
    control,
    handleSubmit,
    getValues,
    watch,
    trigger,
    formState: { isValid, errors },
  } = useFormContext<ThemeFormValues>()
  const titleField = `${currentLocale}-title`
  const slugField = `${currentLocale}-slug`
  const teaserField = `${currentLocale}-teaser`
  const bodyField = `${currentLocale}-body`

  // TextEditor updates the body through setValue without validation, while a secondary title is only
  // required when the body is filled: revalidate the title so emptying the body clears its error
  React.useEffect(() => {
    if (currentLocale === defaultLocale) return
    const subscription = watch((_, { name }) => {
      if (name === bodyField) trigger(titleField)
    })
    return () => subscription.unsubscribe()
  }, [watch, trigger, currentLocale, defaultLocale, bodyField, titleField])

  // Errors of a hidden locale must not lock the form: submitting shows them by switching to their locale
  const errorLocales = Object.keys(errors).map(getFieldLocale)
  const hasOnlyHiddenLocaleErrors =
    errorLocales.length > 0 && errorLocales.every(locale => locale !== null && locale !== currentLocale)

  const onInvalid = (formErrors: FieldErrors<ThemeFormValues>) => {
    const invalidLocales = Object.keys(formErrors).map(getFieldLocale)
    const firstHiddenLocale = invalidLocales.find(locale => locale !== null && locale !== currentLocale)
    if (firstHiddenLocale && !invalidLocales.includes(currentLocale)) setCurrentLocale(firstHiddenLocale)
  }

  return (
    <Flex
      direction="column"
      marginTop="48px"
      spacing={6}
      bg="white"
      borderRadius="accordion"
      p={6}
      justify="space-between"
    >
      <Flex direction="row" alignItems="flex-start" spacing={6} justify="space-between">
        <Flex direction="column" width="70%">
          <FormControl
            name={titleField}
            control={control}
            key={titleField}
            isRequired={currentLocale === defaultLocale}
          >
            <FormLabel htmlFor={titleField} label={intl.formatMessage({ id: 'global.title' })} />
            <FieldInput type="text" id={titleField} name={titleField} control={control} />
          </FormControl>

          {/* The slug is generated from the title when the translation is created, and never updated */}
          {!isNewTheme && getValues(slugField) ? (
            <FormControl name={slugField} control={control} key={slugField}>
              <FormLabel htmlFor={slugField} label={intl.formatMessage({ id: 'global.link' })} />
              <FieldInput type="text" id={slugField} name={slugField} control={control} disabled />
            </FormControl>
          ) : null}

          <FormControl name="author" control={control}>
            <FormLabel htmlFor="author" label={intl.formatMessage({ id: 'global.author' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <UserListField
              clearable
              control={control}
              name="author"
              id="author"
              // @ts-ignore: debounce is forwarded to the underlying FieldSelect but not part of UserListFieldProps
              debounce
              aria-autocomplete="list"
              aria-haspopup="true"
              role="combobox"
              selectFieldIsObject
            />
          </FormControl>

          <FormControl name={teaserField} control={control} key={teaserField}>
            <FormLabel htmlFor={teaserField} label={intl.formatMessage({ id: 'global.subtitle' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FieldInput type="textarea" id={teaserField} name={teaserField} control={control} />
          </FormControl>
        </Flex>

        <Flex width="30%">
          <FormControl name="media" control={control} width="100%" mt={-1} spacing={0}>
            <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'global.image' })}>
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            </FormLabel>
            <FieldInput
              type="uploader"
              name="media"
              id="media"
              control={control}
              format=".jpg,.jpeg,.png"
              maxSize={8000000}
              size={UPLOADER_SIZE.MD}
              uploadURI={UPLOAD_PATH}
              showThumbnail
            />
          </FormControl>
        </Flex>
      </Flex>

      {/* The key remounts the editor on locale change: Jodit only re-renders on selectedLanguage change */}
      <FormControl name={bodyField} key={bodyField} control={control}>
        <TextEditor
          label={intl.formatMessage({ id: 'global.description' })}
          name={bodyField}
          id={bodyField}
          noModalAdvancedEditor
          platformLanguage={defaultLocale}
          selectedLanguage={defaultLocale}
        />
      </FormControl>

      <Flex direction="row" spacing={4}>
        <Button
          type="button"
          loading={isLoading}
          disabled={!isValid && !hasOnlyHiddenLocaleErrors}
          onClick={e => handleSubmit(data => onSubmit(data), onInvalid)(e)}
        >
          {intl.formatMessage({ id: isNewTheme ? 'btn_create' : 'global.save' })}
        </Button>
        {isNewTheme ? (
          <Button variant="tertiary" variantColor="hierarchy" onClick={() => (window.location.href = 'themes')}>
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
        ) : (
          <DeleteThemeConfirmationModal title={String(getValues(`${defaultLocale}-title`))} themeId={themeId} />
        )}
      </Flex>
    </Flex>
  )
}

export default ThemeForm
