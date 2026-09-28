import { FieldInput, FormControl, Select, UploaderValue } from '@cap-collectif/form'
import {
  Box,
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Modal,
  Table,
  Tag,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import ToggleFeatureMutation from '@mutations/ToggleFeatureMutation'
import UpdateEventImageMutation from '@mutations/UpdateEventImageMutation'
import UpdateEventSettingMutation from '@mutations/UpdateEventSettingMutation'
import type { EventSettingsListQuery, TranslationLocale } from '@relay/EventSettingsListQuery.graphql'
import { useFeatureFlag } from '@shared/hooks/useFeatureFlag'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import { formatCodeToLocale } from '@utils/locale-helper'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query EventSettingsListQuery {
    eventSettings {
      id
      keyname
      value
      isEnabled
      type
      isTranslatable
      translations {
        locale
        value
      }
    }
    eventSettingsImages {
      id
      keyname
      isEnabled
      media {
        id
        name
        size
        type: contentType
        url(format: "reference")
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
  }
`

type SiteParameter = EventSettingsListQuery['response']['eventSettings'][number]
type SiteImage = EventSettingsListQuery['response']['eventSettingsImages'][number]
type Locale = EventSettingsListQuery['response']['availableLocales'][number]

type SettingFormValues = { isEnabled: boolean } & Record<string, string | boolean>
type ImageFormValues = { media: UploaderValue | null; isEnabled: boolean }

const Status = ({ enabled }: { enabled: boolean }) => {
  const intl = useIntl()
  return (
    <Tag variantColor={enabled ? 'success' : 'infoGray'}>
      {intl.formatMessage({ id: enabled ? 'global.yes' : 'global.no' })}
    </Tag>
  )
}

const getSettingValue = (setting: SiteParameter, locale: string) =>
  setting.isTranslatable
    ? setting.translations?.find(translation => translation.locale === locale)?.value ?? ''
    : setting.value ?? ''

// Without the multilangue feature only the platform default locale is editable, whatever the admin's
// locale cookie says (the back-end stores the value under the default locale in that case)
const getDisplayedLocale = (
  availableLocales: ReadonlyArray<Locale>,
  viewerLocale: string,
  multilangue: boolean,
): Locale => {
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  if (!multilangue) return defaultLocale
  return availableLocales.find(locale => formatCodeToLocale(locale.code) === viewerLocale) ?? defaultLocale
}

const EventFeatureAction = ({ enabled }: { enabled: boolean }) => {
  const intl = useIntl()
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <Button
      variant="secondary"
      variantColor="hierarchy"
      isLoading={isLoading}
      onClick={async () => {
        setIsLoading(true)
        try {
          await ToggleFeatureMutation.commit({
            input: { type: 'allow_users_to_propose_events', enabled: !enabled },
          })
          successToast(intl.formatMessage({ id: 'global.changes.saved' }))
        } catch {
          mutationErrorToast(intl)
        } finally {
          setIsLoading(false)
        }
      }}
    >
      {intl.formatMessage({ id: enabled ? 'action_disable' : 'action_enable' })}
    </Button>
  )
}

type SettingFormProps = {
  siteParameter: SiteParameter
  availableLocales: Locale[]
  hide: () => void
}

// Rendered inside the Modal body: the Modal unmounts its content on hide, so the form always starts
// from the last saved values when the modal is reopened.
const EventSettingForm = ({ siteParameter, availableLocales, hide }: SettingFormProps) => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const defaultLocaleCode = formatCodeToLocale(
    (availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]).code,
  )
  const [currentLocale, setCurrentLocale] = React.useState<TranslationLocale>(
    getDisplayedLocale(availableLocales, intl.locale, multilangue).code,
  )
  const getFieldName = (code: TranslationLocale) => `${code}-value`
  // One field per locale, so switching language only changes which field is displayed
  const defaultValues = React.useMemo(() => {
    const values: SettingFormValues = { isEnabled: siteParameter.isEnabled }
    availableLocales.forEach(({ code }) => {
      values[getFieldName(code)] = getSettingValue(siteParameter, formatCodeToLocale(code))
    })
    return values
  }, [siteParameter, availableLocales])
  const form = useForm<SettingFormValues>({ defaultValues })
  const { control, handleSubmit, formState } = form
  const inputType = siteParameter.type === 2 ? 'number' : siteParameter.type === 3 ? 'textarea' : 'text'
  const fieldName = getFieldName(currentLocale)

  // Only the locales whose value changed are sent (dirtyFields is not reliable: TextEditor calls
  // setValue() without shouldDirty). A non-translatable setting has a single value.
  const getTranslationsToSave = (values: SettingFormValues) => {
    const codes = siteParameter.isTranslatable ? availableLocales.map(({ code }) => code) : [currentLocale]
    return codes
      .filter(code => {
        const initialValue = String(defaultValues[getFieldName(code)] ?? '')
        const newValue = String(values[getFieldName(code)] ?? '')
        if (newValue === initialValue) return false
        // Rich text editors normalize an empty content to markup like "<p><br></p>"
        return !(isWYSIWYGContentEmpty(initialValue) && isWYSIWYGContentEmpty(newValue))
      })
      .map(code => ({ locale: code, value: String(values[getFieldName(code)] ?? '') }))
  }

  const onSubmit = async (values: SettingFormValues) => {
    try {
      const response = await UpdateEventSettingMutation.commit({
        input: {
          id: siteParameter.id,
          translations: getTranslationsToSave(values),
          isEnabled: Boolean(values.isEnabled),
        },
      })
      if (response.updateEventSetting.errorCode) {
        mutationErrorToast(intl)
        return
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
          {siteParameter.isTranslatable && multilangue && (
            <Flex mb={4}>
              <Box width="180px">
                <Select
                  options={availableLocales.map(locale => ({
                    label: intl.formatMessage({ id: locale.traductionKey }),
                    value: locale.code,
                  }))}
                  value={currentLocale}
                  onChange={value => {
                    const locale = availableLocales.find(({ code }) => code === value)
                    if (locale) setCurrentLocale(locale.code)
                  }}
                />
              </Box>
            </Flex>
          )}
          {/* The key remounts the editor on locale change: Jodit only re-renders on selectedLanguage change */}
          <FormControl name={fieldName} control={control} key={fieldName}>
            {siteParameter.type === 1 ? (
              <TextEditor
                label={intl.formatMessage({ id: 'global.value' })}
                name={fieldName}
                noModalAdvancedEditor
                platformLanguage={defaultLocaleCode}
                selectedLanguage={defaultLocaleCode}
              />
            ) : (
              <>
                <FormLabel htmlFor={fieldName} label={intl.formatMessage({ id: 'global.value' })} />
                <FieldInput id={fieldName} name={fieldName} control={control} type={inputType} />
              </>
            )}
          </FormControl>
          <FormControl name="isEnabled" control={control}>
            <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
            <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
          </FormControl>
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button variant="secondary" variantColor="hierarchy" onClick={hide}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button type="submit" form={formId} isLoading={formState.isSubmitting}>
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </FormProvider>
  )
}

const EventSettingModal = ({
  siteParameter,
  availableLocales,
}: {
  siteParameter: SiteParameter
  availableLocales: Locale[]
}) => {
  const intl = useIntl()

  return (
    <Modal
      ariaLabel="edit-event-setting"
      size={CapUIModalSize.Md}
      hideOnClickOutside={false}
      forceModalDialogToFalse
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          variantColor="hierarchy"
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: siteParameter.keyname })}</Heading>
          </Modal.Header>
          <EventSettingForm siteParameter={siteParameter} availableLocales={availableLocales} hide={hide} />
        </>
      )}
    </Modal>
  )
}

const EventImageModal = ({ image }: { image: SiteImage }) => {
  const intl = useIntl()
  const formId = React.useId()
  const defaultValues = { media: image.media, isEnabled: image.isEnabled }
  const { control, handleSubmit, formState, reset } = useForm<ImageFormValues>({ defaultValues })

  return (
    <Modal
      ariaLabel="edit-event-image"
      size={CapUIModalSize.Md}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          variantColor="hierarchy"
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: image.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <Flex
              as="form"
              id={formId}
              direction="column"
              onSubmit={handleSubmit(async values => {
                try {
                  const media = Array.isArray(values.media) ? values.media[0] : values.media
                  const response = await UpdateEventImageMutation.commit({
                    input: { id: image.id, mediaId: media?.id ?? null, isEnabled: values.isEnabled },
                  })
                  if (response.updateEventImage.errorCode) {
                    mutationErrorToast(intl)
                    return
                  }
                  successToast(intl.formatMessage({ id: 'global.changes.saved' }))
                  hide()
                } catch {
                  mutationErrorToast(intl)
                }
              })}
            >
              <FormControl name="media" control={control}>
                <FormLabel label={intl.formatMessage({ id: 'global.image' })} />
                <FieldInput
                  type="uploader"
                  name="media"
                  control={control}
                  format=".jpg,.jpeg,.png,.svg"
                  maxSize={204800}
                  size={UPLOADER_SIZE.MD}
                  uploadURI={UPLOAD_PATH}
                  showThumbnail
                />
              </FormControl>
              <FormControl name="isEnabled" control={control}>
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
              </FormControl>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button
                variant="secondary"
                variantColor="hierarchy"
                onClick={() => {
                  reset(defaultValues)
                  hide()
                }}
              >
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button type="submit" form={formId} isLoading={formState.isSubmitting}>
                {intl.formatMessage({ id: 'global.save' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const EventSettingsList = () => {
  const intl = useIntl()
  const { eventSettings, eventSettingsImages, availableLocales } = useLazyLoadQuery<EventSettingsListQuery>(QUERY, {})
  const allowUsersToProposeEvents = useFeatureFlag('allow_users_to_propose_events')
  const settings = [...eventSettings, ...eventSettingsImages]
  const multilangue = useFeatureFlag('multilangue')
  const displayedLocaleCode = formatCodeToLocale(getDisplayedLocale(availableLocales, intl.locale, multilangue).code)

  return (
    <Box bg="white" p={6} borderRadius="8px">
      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.name' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.enabled' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.value' })}</Table.Th>
            <Table.Th width="10%" textAlign="center">
              {intl.formatMessage({ id: 'admin.settings.header.action' })}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr bg="white">
            <Table.Td>{intl.formatMessage({ id: 'capco.module.allow_users_to_propose_events' })}</Table.Td>
            <Table.Td>
              <Status enabled={allowUsersToProposeEvents} />
            </Table.Td>
            <Table.Td>-</Table.Td>
            <Table.Td>
              <Flex justify="center">
                <EventFeatureAction enabled={allowUsersToProposeEvents} />
              </Flex>
            </Table.Td>
          </Table.Tr>
          {settings.map((setting, index) => (
            <Table.Tr key={setting.id} bg={index % 2 === 0 ? 'gray.50' : 'white'}>
              <Table.Td>{intl.formatMessage({ id: setting.keyname })}</Table.Td>
              <Table.Td>
                <Status enabled={setting.isEnabled} />
              </Table.Td>
              <Table.Td>
                {'value' in setting ? (
                  getSettingValue(setting, displayedLocaleCode)
                ) : setting.media?.url ? (
                  <Box
                    as="img"
                    src={setting.media.url}
                    alt={setting.media.name}
                    width="32px"
                    height="32px"
                    sx={{ objectFit: 'contain' }}
                  />
                ) : (
                  '-'
                )}
              </Table.Td>
              <Table.Td>
                <Flex justify="center">
                  {'value' in setting ? (
                    <EventSettingModal siteParameter={setting} availableLocales={[...availableLocales]} />
                  ) : (
                    <EventImageModal image={setting} />
                  )}
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}

export default EventSettingsList
