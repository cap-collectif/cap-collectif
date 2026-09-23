import * as React from 'react'
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
import UpdateBlogImageMutation from '@mutations/UpdateBlogImageMutation'
import UpdateBlogSettingMutation from '@mutations/UpdateBlogSettingMutation'
import type { BlogSettingsListQuery } from '@relay/BlogSettingsListQuery.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import { formatCodeToLocale } from '@utils/locale-helper'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

const QUERY = graphql`
  query BlogSettingsListQuery {
    blogSettings {
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
    blogSettingsImages {
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

type SiteParameter = BlogSettingsListQuery['response']['blogSettings'][number]
type SiteImage = BlogSettingsListQuery['response']['blogSettingsImages'][number]
type Locale = BlogSettingsListQuery['response']['availableLocales'][number]

type SettingFormValues = { value: string; isEnabled: boolean }
type ImageFormValues = { media: UploaderValue | null; isEnabled: boolean }

const Status = ({ enabled }: { enabled: boolean }) => {
  const intl = useIntl()
  return (
    <Tag variantColor={enabled ? 'success' : 'infoGray'}>
      {intl.formatMessage({ id: enabled ? 'global.yes' : 'global.no' })}
    </Tag>
  )
}

const BlogSettingModal = ({
  siteParameter,
  availableLocales,
}: {
  siteParameter: SiteParameter
  availableLocales: Locale[]
}) => {
  const intl = useIntl()
  const formId = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  const defaultLocaleCode = formatCodeToLocale(defaultLocale.code)
  const [localeSelected, setLocaleSelected] = React.useState({
    label: intl.formatMessage({ id: defaultLocale.traductionKey }),
    value: defaultLocaleCode,
  })
  const [drafts, setDrafts] = React.useState<Record<string, SettingFormValues>>({})
  const getDefaultValues = (locale = localeSelected.value) => ({
    value: siteParameter.isTranslatable
      ? siteParameter.translations?.find(translation => translation.locale === locale)?.value ??
        (locale === defaultLocaleCode ? siteParameter.value ?? '' : '')
      : siteParameter.value ?? '',
    isEnabled: siteParameter.isEnabled,
  })
  const defaultValues = getDefaultValues()
  const form = useForm<SettingFormValues>({ defaultValues })
  const { control, getValues, handleSubmit, formState, reset } = form
  const inputType = siteParameter.type === 2 ? 'number' : siteParameter.type === 3 ? 'textarea' : 'text'

  return (
    <Modal
      ariaLabel="edit-blog-setting"
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
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: siteParameter.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column">
            <FormProvider {...form}>
              <Flex
                as="form"
                id={formId}
                direction="column"
                onSubmit={handleSubmit(async values => {
                  try {
                    const response = await UpdateBlogSettingMutation.commit({
                      input: {
                        id: siteParameter.id,
                        value: String(values.value),
                        locale: localeSelected.value,
                        isEnabled: values.isEnabled,
                      },
                    })
                    if (response.updateBlogSetting.errorCode) {
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
                <FormControl name="value" control={control}>
                  {siteParameter.isTranslatable && multilangue && (
                    <Flex justify="flex-end" mb={4}>
                      <Box width="180px">
                        <Select
                          options={availableLocales.map(locale => ({
                            label: intl.formatMessage({ id: locale.traductionKey }),
                            value: formatCodeToLocale(locale.code),
                          }))}
                          value={localeSelected.value}
                          onChange={value => {
                            const locale = availableLocales.find(item => formatCodeToLocale(item.code) === value)
                            if (locale) {
                              setDrafts(currentDrafts => ({ ...currentDrafts, [localeSelected.value]: getValues() }))
                              const selectedLocale = {
                                label: intl.formatMessage({ id: locale.traductionKey }),
                                value: formatCodeToLocale(locale.code),
                              }
                              setLocaleSelected(selectedLocale)
                              reset(drafts[selectedLocale.value] ?? getDefaultValues(selectedLocale.value))
                            }
                          }}
                        />
                      </Box>
                    </Flex>
                  )}
                  {siteParameter.type === 1 ? (
                    <TextEditor
                      label={intl.formatMessage({ id: 'global.value' })}
                      name="value"
                      noModalAdvancedEditor
                      selectedLanguage={localeSelected.value}
                    />
                  ) : (
                    <>
                      <FormLabel htmlFor="value" label={intl.formatMessage({ id: 'global.value' })} />
                      <FieldInput
                        id="value"
                        name="value"
                        control={control}
                        type={inputType}
                        maxLength={siteParameter.keyname === 'blog.metadescription' ? 160 : undefined}
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

const BlogImageModal = ({ image }: { image: SiteImage }) => {
  const intl = useIntl()
  const formId = React.useId()
  const defaultValues = { media: image.media, isEnabled: image.isEnabled }
  const { control, handleSubmit, formState, reset } = useForm<ImageFormValues>({ defaultValues })

  return (
    <Modal
      ariaLabel="edit-blog-image"
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
                  const response = await UpdateBlogImageMutation.commit({
                    input: { id: image.id, mediaId: media?.id ?? null, isEnabled: values.isEnabled },
                  })
                  if (response.updateBlogImage.errorCode) {
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

const BlogSettingsList = () => {
  const intl = useIntl()
  const { blogSettings, blogSettingsImages, availableLocales } = useLazyLoadQuery<BlogSettingsListQuery>(QUERY, {})
  const settings = [...blogSettings, ...blogSettingsImages]

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
          {settings.map((setting, index) => (
            <Table.Tr key={setting.id} rowId={setting.id} bg={index % 2 === 0 ? 'white' : 'gray.50'}>
              <Table.Td>{intl.formatMessage({ id: setting.keyname })}</Table.Td>
              <Table.Td>
                <Status enabled={setting.isEnabled} />
              </Table.Td>
              <Table.Td>
                {'value' in setting ? (
                  setting.value
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
                    <BlogSettingModal siteParameter={setting} availableLocales={[...availableLocales]} />
                  ) : (
                    <BlogImageModal image={setting} />
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

export default BlogSettingsList
