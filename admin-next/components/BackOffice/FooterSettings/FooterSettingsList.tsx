import { FieldInput, FormControl, Select } from '@cap-collectif/form'
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
  Text,
} from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import UpdateFooterColorMutation from '@mutations/UpdateFooterColorMutation'
import UpdateFooterSettingMutation from '@mutations/UpdateFooterSettingMutation'
import type { FooterSettingsListQuery, TranslationLocale } from '@relay/FooterSettingsListQuery.graphql'
import { useFeatureFlag } from '@shared/hooks/useFeatureFlag'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { formatCodeToLocale } from '@utils/locale-helper'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query FooterSettingsListQuery {
    footerSettings {
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
    footerColors {
      id
      keyname
      value
      isEnabled
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
  }
`

type Setting = FooterSettingsListQuery['response']['footerSettings'][number]
type Color = FooterSettingsListQuery['response']['footerColors'][number]
type Locale = FooterSettingsListQuery['response']['availableLocales'][number]
type Values = { isEnabled: boolean } & Record<string, string | boolean>
const COLORS = ['color.footer.text', 'color.footer.bg', 'color.footer.title']
const isSetting = (row: Setting | Color): row is Setting => 'isTranslatable' in row

const Status = ({ value }: { value: boolean }) => {
  const intl = useIntl()
  return (
    <Tag variantColor={value ? 'success' : 'infoGray'}>
      {intl.formatMessage({ id: value ? 'global.yes' : 'global.no' })}
    </Tag>
  )
}
const valueFor = (setting: Setting, locale: string) =>
  setting.isTranslatable ? setting.translations.find(t => t.locale === locale)?.value ?? '' : setting.value ?? ''
const displayedLocale = (locales: readonly Locale[], viewerLocale: string, multilangue: boolean) => {
  const fallback = locales.find(locale => locale.isDefault) ?? locales[0]
  return multilangue ? locales.find(locale => formatCodeToLocale(locale.code) === viewerLocale) ?? fallback : fallback
}

const SettingModal = ({ setting, locales }: { setting: Setting; locales: Locale[] }) => {
  const intl = useIntl()
  const id = React.useId()
  const multilangue = useFeatureFlag('multilangue')
  const defaultLocale = displayedLocale(locales, intl.locale, multilangue)
  const [locale, setLocale] = React.useState<TranslationLocale>(defaultLocale.code)
  const name = (code: TranslationLocale) => `${code}-value`
  const defaults = React.useMemo(
    () =>
      locales.reduce<Values>(
        (values, item) => ({ ...values, [name(item.code)]: valueFor(setting, formatCodeToLocale(item.code)) }),
        { isEnabled: setting.isEnabled },
      ),
    [setting, locales],
  )
  const form = useForm<Values>({ defaultValues: defaults })
  const field = name(locale)
  const submit = async (values: Values, hide: () => void) => {
    const codes = setting.isTranslatable ? locales.map(item => item.code) : [locale]
    const translations = codes
      .filter(code => {
        const before = String(defaults[name(code)] ?? '')
        const after = String(values[name(code)] ?? '')
        return before !== after && !(isWYSIWYGContentEmpty(before) && isWYSIWYGContentEmpty(after))
      })
      .map(code => ({ locale: code, value: String(values[name(code)] ?? '') }))
    try {
      const response = await UpdateFooterSettingMutation.commit({
        input: { id: setting.id, translations, isEnabled: Boolean(values.isEnabled) },
      })
      if (response.updateFooterSetting.errorCode) return mutationErrorToast(intl)
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      hide()
    } catch {
      mutationErrorToast(intl)
    }
  }
  return (
    <Modal
      ariaLabel="edit-footer-setting"
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
      onOpen={() => {
        setLocale(defaultLocale.code)
        form.reset(defaults)
      }}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: setting.keyname })}</Heading>
          </Modal.Header>
          <FormProvider {...form}>
            <Modal.Body direction="column">
              <Flex
                as="form"
                id={id}
                direction="column"
                spacing={4}
                onSubmit={form.handleSubmit(values => submit(values, hide))}
              >
                {setting.isTranslatable && multilangue && (
                  <Box width="180px">
                    <Select
                      options={locales.map(item => ({
                        label: intl.formatMessage({ id: item.traductionKey }),
                        value: item.code,
                      }))}
                      value={locale}
                      onChange={value => setLocale(value as TranslationLocale)}
                    />
                  </Box>
                )}
                <FormControl name={field} control={form.control} key={field}>
                  {setting.type === 1 ? (
                    <TextEditor
                      label={intl.formatMessage({ id: 'global.value' })}
                      name={field}
                      noModalAdvancedEditor
                      platformLanguage={formatCodeToLocale((locales.find(item => item.isDefault) ?? locales[0]).code)}
                      selectedLanguage={formatCodeToLocale((locales.find(item => item.isDefault) ?? locales[0]).code)}
                    />
                  ) : (
                    <>
                      <FormLabel htmlFor={field} label={intl.formatMessage({ id: 'global.value' })} />
                      <FieldInput id={field} name={field} control={form.control} type="text" />
                    </>
                  )}
                </FormControl>
                <FormControl name="isEnabled" control={form.control}>
                  <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                  <FieldInput id="isEnabled" name="isEnabled" control={form.control} type="switch" />
                </FormControl>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <ButtonGroup>
                <Button variant="secondary" variantColor="hierarchy" onClick={hide}>
                  {intl.formatMessage({ id: 'global.cancel' })}
                </Button>
                <Button type="submit" form={id} isLoading={form.formState.isSubmitting}>
                  {intl.formatMessage({ id: 'global.save' })}
                </Button>
              </ButtonGroup>
            </Modal.Footer>
          </FormProvider>
        </>
      )}
    </Modal>
  )
}

const ColorModal = ({ color }: { color: Color }) => {
  const intl = useIntl()
  const id = React.useId()
  const defaults = { value: color.value ?? '', isEnabled: color.isEnabled }
  const form = useForm({ defaultValues: defaults })
  return (
    <Modal
      ariaLabel="edit-footer-color"
      size={CapUIModalSize.Md}
      scrollBehavior="outside"
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Pencil}
          size={CapUIIconSize.Md}
          variantColor="hierarchy"
          label={intl.formatMessage({ id: 'global.edit' })}
        />
      }
      onOpen={() => form.reset(defaults)}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: color.keyname })}</Heading>
          </Modal.Header>
          <Modal.Body direction="column" overflow="visible">
            <Flex
              as="form"
              id={id}
              direction="column"
              spacing={4}
              onSubmit={form.handleSubmit(async values => {
                try {
                  const response = await UpdateFooterColorMutation.commit({
                    input: { id: color.id, value: values.value, isEnabled: values.isEnabled },
                  })
                  if (response.updateFooterColor.errorCode) return mutationErrorToast(intl)
                  successToast(intl.formatMessage({ id: 'global.changes.saved' }))
                  hide()
                } catch {
                  mutationErrorToast(intl)
                }
              })}
            >
              <FormControl name="value" control={form.control}>
                <FormLabel htmlFor="value" label={intl.formatMessage({ id: 'global.color' })} />
                <FieldInput id="value" name="value" control={form.control} type="colorPicker" />
              </FormControl>
              <FormControl name="isEnabled" control={form.control}>
                <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
                <FieldInput id="isEnabled" name="isEnabled" control={form.control} type="switch" />
              </FormControl>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button type="submit" form={id} isLoading={form.formState.isSubmitting}>
                {intl.formatMessage({ id: 'global.save' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

const FooterSettingsList = () => {
  const intl = useIntl()
  const { footerSettings, footerColors, availableLocales } = useLazyLoadQuery<FooterSettingsListQuery>(QUERY, {})
  const multilangue = useFeatureFlag('multilangue')
  const locale = formatCodeToLocale(displayedLocale(availableLocales, intl.locale, multilangue).code)
  const rows = [...footerSettings, ...footerColors.filter(color => COLORS.includes(color.keyname))]
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
          {rows.map((row, index) => (
            <Table.Tr key={row.id} bg={index % 2 === 0 ? 'white' : 'gray.50'}>
              <Table.Td>{intl.formatMessage({ id: row.keyname })}</Table.Td>
              <Table.Td>
                <Status value={row.isEnabled} />
              </Table.Td>
              <Table.Td>
                {isSetting(row) ? (
                  valueFor(row, locale)
                ) : row.value ? (
                  <Flex align="center" spacing={2}>
                    <Box
                      width="20px"
                      height="20px"
                      borderRadius="4px"
                      bg={row.value}
                      border="1px solid"
                      borderColor="gray.200"
                    />
                    <Text>{row.value}</Text>
                  </Flex>
                ) : (
                  intl.formatMessage({ id: 'admin.settings.color.undefined' })
                )}
              </Table.Td>
              <Table.Td>
                <Flex justify="center">
                  {isSetting(row) ? (
                    <SettingModal setting={row} locales={[...availableLocales]} />
                  ) : (
                    <ColorModal color={row} />
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

export default FooterSettingsList
