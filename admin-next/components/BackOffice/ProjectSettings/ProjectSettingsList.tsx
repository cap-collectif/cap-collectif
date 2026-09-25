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
import UpdateProjectImageMutation from '@mutations/UpdateProjectImageMutation'
import UpdateProjectSettingMutation from '@mutations/UpdateProjectSettingMutation'
import type { ProjectSettingsListQuery } from '@relay/ProjectSettingsListQuery.graphql'
import { useFeatureFlag } from '@shared/hooks/useFeatureFlag'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import { formatCodeToLocale } from '@utils/locale-helper'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query ProjectSettingsListQuery {
    projectSettings {
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
    projectSettingsImages {
      id
      keyname
      isEnabled
      media {
        id
        name
        size
        type: contentType
        url(format: "default_logo")
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
  }
`

type Setting = ProjectSettingsListQuery['response']['projectSettings'][number]
type Image = ProjectSettingsListQuery['response']['projectSettingsImages'][number]
type Locale = ProjectSettingsListQuery['response']['availableLocales'][number]

const Status = ({ enabled }: { enabled: boolean }) => {
  const intl = useIntl()
  return (
    <Tag variantColor={enabled ? 'success' : 'infoGray'}>
      {intl.formatMessage({ id: enabled ? 'global.yes' : 'global.no' })}
    </Tag>
  )
}

// A translatable setting's `value` field resolves against the admin's own current locale (see
// `SiteParameter::getValue()`), not the platform's default locale, so it must never be used as a
// fallback for a specific language: each language's value comes solely from `translations`.
const getSettingValue = (setting: Setting, locale: string) =>
  setting.isTranslatable
    ? setting.translations?.find(translation => translation.locale === locale)?.value ?? ''
    : setting.value ?? ''

const ProjectFeatureAction = ({ feature }: { feature: 'projects_form' | 'project_trash' }) => {
  const intl = useIntl()
  const enabled = useFeatureFlag(feature)
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <Button
      variant="secondary"
      variantColor="hierarchy"
      isLoading={isLoading}
      onClick={async () => {
        setIsLoading(true)
        try {
          const response = await ToggleFeatureMutation.commit({ input: { type: feature, enabled: !enabled } })
          if (!response.toggleFeature?.featureFlag) return mutationErrorToast(intl)
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

const ProjectFeatureRow = ({ feature }: { feature: 'projects_form' | 'project_trash' }) => {
  const intl = useIntl()
  const enabled = useFeatureFlag(feature)
  return (
    <Table.Tr>
      <Table.Td>{intl.formatMessage({ id: `capco.module.${feature}` })}</Table.Td>
      <Table.Td>
        <Status enabled={enabled} />
      </Table.Td>
      <Table.Td>N/A</Table.Td>
      <Table.Td>
        <Flex justifyContent={'center'}>
          <ProjectFeatureAction feature={feature} />
        </Flex>
      </Table.Td>
    </Table.Tr>
  )
}

const SettingModal = ({
  setting,
  locales,
  initialLocale,
}: {
  setting: Setting
  locales: Locale[]
  initialLocale: string
}) => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const defaultLocale = locales.find(locale => locale.isDefault) ?? locales[0]
  const defaultLocaleCode = formatCodeToLocale(defaultLocale.code)
  const [locale, setLocale] = React.useState(initialLocale)
  // One form value per language, all loaded at once, so switching the language selector never
  // discards what was typed in another language (the selector only changes which field is shown).
  const getDefaultValues = () => ({
    translations: Object.fromEntries(
      locales.map(item => {
        const code = formatCodeToLocale(item.code)
        return [code, getSettingValue(setting, code)]
      }),
    ),
    isEnabled: setting.isEnabled,
  })
  const form = useForm<{ translations: Record<string, string>; isEnabled: boolean }>({
    defaultValues: getDefaultValues(),
  })
  const { control, handleSubmit, formState, reset } = form
  const inputType = setting.type === 2 ? 'number' : setting.type === 3 ? 'textarea' : 'text'
  // Snapshot of what each language held when the modal was (last) opened — used at submit time to
  // tell which languages were actually edited, since `UpdateProjectSettingMutation` only persists
  // one language per call and RHF's `dirtyFields` isn't reliable here (`TextEditor` calls
  // `setValue()` without `shouldDirty`).
  const initialTranslationsRef = React.useRef(getDefaultValues().translations)

  return (
    <Modal
      ariaLabel="edit-project-setting"
      size={CapUIModalSize.Md}
      hideOnClickOutside={false}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          variantColor="hierarchy"
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      }
      onOpen={() => {
        // Re-sync on every open: the row may have been sitting on a stale locale/value since the
        // last time this setting was edited (or since the BO's display language was switched).
        const values = getDefaultValues()
        initialTranslationsRef.current = values.translations
        setLocale(initialLocale)
        reset(values)
      }}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: setting.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <FormProvider {...form}>
              <Flex
                as="form"
                id={formId}
                direction="column"
                onSubmit={handleSubmit(async data => {
                  // Persist every language that was actually edited, not just the one currently
                  // displayed — otherwise switching tabs before saving would silently drop it.
                  // `locale` (the currently displayed tab) is always included so that an
                  // `isEnabled`-only change, or a first save with no edits, still goes through.
                  const editedLocales = setting.isTranslatable
                    ? locales
                        .map(item => formatCodeToLocale(item.code))
                        .filter(code => data.translations[code] !== initialTranslationsRef.current[code])
                    : []
                  const localesToSave = Array.from(new Set([...editedLocales, locale]))

                  try {
                    for (const code of localesToSave) {
                      const response = await UpdateProjectSettingMutation.commit({
                        input: {
                          id: setting.id,
                          value: String(data.translations[code] ?? ''),
                          locale: code,
                          isEnabled: data.isEnabled,
                        },
                      })
                      if (response.updateProjectSetting.errorCode) return mutationErrorToast(intl)
                    }
                    successToast(intl.formatMessage({ id: 'global.changes.saved' }))
                    hide()
                  } catch {
                    mutationErrorToast(intl)
                  }
                })}
              >
                {setting.isTranslatable && multilangue && (
                  <Flex mb={4}>
                    <Box width="180px">
                      <Select
                        options={locales.map(item => ({
                          label: intl.formatMessage({ id: item.traductionKey }),
                          value: formatCodeToLocale(item.code),
                        }))}
                        value={locale}
                        onChange={value => {
                          const selected = locales.find(item => formatCodeToLocale(item.code) === value)
                          // Only switches which language's field is displayed — every language's
                          // value already lives in the form, nothing to reset.
                          if (selected) setLocale(formatCodeToLocale(selected.code))
                        }}
                      />
                    </Box>
                  </Flex>
                )}
                <FormControl name={`translations.${locale}`} control={control} key={locale}>
                  {setting.type === 1 ? (
                    <TextEditor
                      label={intl.formatMessage({ id: 'global.value' })}
                      name={`translations.${locale}`}
                      noModalAdvancedEditor
                      platformLanguage={defaultLocaleCode}
                      // Fixed to the platform's default locale, not the currently displayed one:
                      // `key={locale}` on the surrounding FormControl already forces the remount
                      // that swaps the content (Jodit.tsx memoizes its whole render on this prop —
                      // see PostForm.tsx, the reference for this exact pattern). Also varying it
                      // with the content locale fights that memoization and was causing an
                      // infinite render loop ("Maximum update depth exceeded").
                      selectedLanguage={defaultLocaleCode}
                    />
                  ) : (
                    <>
                      <FormLabel
                        htmlFor={`translations.${locale}`}
                        label={intl.formatMessage({ id: 'global.value' })}
                      />
                      <FieldInput
                        id={`translations.${locale}`}
                        name={`translations.${locale}`}
                        control={control}
                        type={inputType}
                      />
                    </>
                  )}
                </FormControl>
                <FormControl name="isEnabled" control={control}>
                  <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                  <FieldInput id="isEnabled" name="isEnabled" control={control} type="switch" />
                </FormControl>
              </Flex>
            </FormProvider>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button
                variant="secondary"
                variantColor="hierarchy"
                onClick={() => {
                  reset(getDefaultValues())
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

const ImageModal = ({ image }: { image: Image }) => {
  const intl = useIntl()
  const formId = React.useId()
  const form = useForm<{ media: UploaderValue | null; isEnabled: boolean }>({
    defaultValues: { media: image.media, isEnabled: image.isEnabled },
  })
  const { control, handleSubmit, formState, reset } = form
  return (
    <Modal
      ariaLabel="edit-project-image"
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
              onSubmit={handleSubmit(async data => {
                try {
                  const media = Array.isArray(data.media) ? data.media[0] : data.media
                  const response = await UpdateProjectImageMutation.commit({
                    input: { id: image.id, mediaId: media?.id ?? null, isEnabled: data.isEnabled },
                  })
                  if (response.updateProjectImage.errorCode) return mutationErrorToast(intl)
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
                  reset()
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

const ProjectSettingsList = () => {
  const intl = useIntl()
  const { projectSettings, projectSettingsImages, availableLocales } = useLazyLoadQuery<ProjectSettingsListQuery>(
    QUERY,
    {},
  )
  const settings = [...projectSettings, ...projectSettingsImages]
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  const defaultLocaleCode = formatCodeToLocale(defaultLocale.code)
  const selectedLocale = availableLocales.some(locale => formatCodeToLocale(locale.code) === intl.locale)
    ? intl.locale
    : defaultLocaleCode
  return (
    <Box bg="white" p={6} borderRadius="8px">
      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.name' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'admin.settings.header.enabled' })}</Table.Th>
            <Table.Th>{intl.formatMessage({ id: 'global.value' })}</Table.Th>
            <Table.Th display="flex" justifyContent="center">
              {intl.formatMessage({ id: 'admin.settings.header.action' })}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <ProjectFeatureRow feature="projects_form" />
          <ProjectFeatureRow feature="project_trash" />
          {settings.map((setting, index) => (
            <Table.Tr key={setting.id} bg={index % 2 === 0 ? 'white' : 'gray.50'}>
              <Table.Td>{intl.formatMessage({ id: setting.keyname })}</Table.Td>
              <Table.Td>
                <Status enabled={setting.isEnabled} />
              </Table.Td>
              <Table.Td>
                {'value' in setting ? (
                  getSettingValue(setting, selectedLocale)
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
                <Flex justifyContent={'center'}>
                  {'value' in setting ? (
                    <SettingModal setting={setting} locales={[...availableLocales]} initialLocale={selectedLocale} />
                  ) : (
                    <ImageModal image={setting} />
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

export default ProjectSettingsList
