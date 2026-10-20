import { FieldInput, FormControl, Select } from '@cap-collectif/form'
import { Box, Button, CapUIFontSize, Flex, FormLabel, Text } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import DeleteMenuItemConfirmationModal from './DeleteMenuItemConfirmationModal'
import { Locale, MenuItemFormValues } from './MenuItem.type'
import { getLinkFieldName, getTitleFieldName } from './utils'

type Option = { value: string; label: string }

type Props = {
  menuItemId: string | null
  isDeletable: boolean
  hasChildren: boolean
  isLinkLocked: boolean
  locales: ReadonlyArray<Locale>
  defaultLocale: Locale
  parentOptions: Array<Option>
  pageOptions: Array<Option>
  onSubmit: (values: MenuItemFormValues) => Promise<void>
}

const MenuItemForm = ({
  menuItemId,
  isDeletable,
  hasChildren,
  isLinkLocked,
  locales,
  defaultLocale,
  parentOptions,
  pageOptions,
  onSubmit,
}: Props): JSX.Element => {
  const intl = useIntl()
  const multilangue = useFeatureFlag('multilangue')
  const { control, handleSubmit, watch, setValue, formState } = useFormContext<MenuItemFormValues>()
  const [currentLocale, setCurrentLocale] = React.useState<Locale['code']>(defaultLocale.code)
  const isNew = !menuItemId

  const titleFieldName = getTitleFieldName(currentLocale)
  const linkFieldName = getLinkFieldName(currentLocale)
  const menu = watch('menu')
  const page = watch('page')
  const links = locales.map(({ code }) => String(watch(getLinkFieldName(code)) ?? '').trim())
  const hasLink = links.some(link => link !== '')
  // A custom page provides the link by itself, and a mandatory item always targets an internal link
  const isLinkDisabled = Boolean(page) || isLinkLocked
  const isExternalLinkDisabled = isLinkDisabled || !hasLink

  React.useEffect(() => {
    if (isExternalLinkDisabled) setValue('isExternalLink', false)
  }, [isExternalLinkDisabled, setValue])

  React.useEffect(() => {
    // Sub menus only exist in the main navigation bar
    if (menu === 'FOOTER') setValue('parent', '')
  }, [menu, setValue])

  return (
    <Flex
      as="form"
      direction="column"
      spacing={6}
      bg="white"
      borderRadius="accordion"
      p={6}
      width="100%"
      // Let yup display the translated validation messages instead of the browser ones
      noValidate
      onSubmit={handleSubmit(onSubmit, errors => {
        // Show the language holding the invalid title or link, as the other languages are hidden
        const isLocaleInvalid = (code: string) =>
          Boolean(errors[getTitleFieldName(code)] || errors[getLinkFieldName(code)])
        const isCurrentLocaleInvalid = isLocaleInvalid(currentLocale)
        const invalidLocale = locales.find(({ code }) => isLocaleInvalid(code))
        if (!isCurrentLocaleInvalid && invalidLocale) setCurrentLocale(invalidLocale.code)
      })}
    >
      {multilangue && (
        <Box width="180px">
          <FormLabel htmlFor="currentLocale" label={intl.formatMessage({ id: 'global-languages' })} />
          {/* Displayed language only, outside react-hook-form */}
          <Select
            role="listbox"
            options={locales.map(locale => ({
              value: locale.code,
              label: intl.formatMessage({ id: locale.traductionKey }),
            }))}
            value={currentLocale}
            onChange={value => {
              const locale = locales.find(({ code }) => code === value)
              if (locale) setCurrentLocale(locale.code)
            }}
          />
        </Box>
      )}

      <Flex direction="column" width={['100%', '100%', '60%']}>
        <FormControl name={titleFieldName} control={control} key={titleFieldName} isRequired>
          <FormLabel htmlFor={titleFieldName} label={intl.formatMessage({ id: 'global.title' })} />
          <FieldInput type="text" id={titleFieldName} name={titleFieldName} control={control} />
        </FormControl>

        <FormControl name="menu" control={control} isRequired>
          <FormLabel htmlFor="menu" label={intl.formatMessage({ id: 'admin.fields.menu_item.menu' })} />
          <FieldInput
            type="select"
            id="menu"
            name="menu"
            control={control}
            options={[
              { value: 'HEADER', label: intl.formatMessage({ id: 'menu.type.header' }) },
              { value: 'FOOTER', label: intl.formatMessage({ id: 'global.footer' }) },
            ]}
          />
        </FormControl>

        {/* The navigation bar displays a single level of sub menus */}
        <FormControl name="parent" control={control} isDisabled={menu === 'FOOTER' || hasChildren}>
          <FormLabel htmlFor="parent" label={intl.formatMessage({ id: 'admin.fields.menu_item.parent' })}>
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
              {intl.formatMessage({ id: 'global.optional' })}
            </Text>
          </FormLabel>
          <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
            {intl.formatMessage({ id: 'admin.help.menu_item.parent' })}
          </Text>
          <FieldInput type="select" id="parent" name="parent" control={control} options={parentOptions} clearable />
        </FormControl>

        <FormControl name="page" control={control} isDisabled={isLinkLocked}>
          <FormLabel htmlFor="page" label={intl.formatMessage({ id: 'admin.menu-items.custom-page' })}>
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
              {intl.formatMessage({ id: 'global.optional' })}
            </Text>
          </FormLabel>
          <FieldInput type="select" id="page" name="page" control={control} options={pageOptions} clearable />
        </FormControl>

        <FormControl name={linkFieldName} control={control} key={linkFieldName} isDisabled={isLinkDisabled}>
          <FormLabel htmlFor={linkFieldName} label={intl.formatMessage({ id: 'global.link' })}>
            <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
              {intl.formatMessage({ id: 'global.optional' })}
            </Text>
          </FormLabel>
          <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
            {intl.formatMessage({ id: 'admin.help.menu_item.link' })}
          </Text>
          <FieldInput type="text" id={linkFieldName} name={linkFieldName} control={control} placeholder="https://" />
        </FormControl>

        <FormControl name="isExternalLink" control={control} isDisabled={isExternalLinkDisabled}>
          <FieldInput type="checkbox" id="isExternalLink" name="isExternalLink" control={control}>
            {intl.formatMessage({ id: 'admin.menu-items.external-link' })}
          </FieldInput>
        </FormControl>

        <FormControl name="position" control={control} isRequired width="30%">
          <FormLabel htmlFor="position" label={intl.formatMessage({ id: 'global.position' })} />
          <FieldInput type="number" id="position" name="position" control={control} />
        </FormControl>

        <FormControl name="isEnabled" control={control}>
          <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
          <FieldInput type="switch" id="isEnabled" name="isEnabled" control={control} />
        </FormControl>
      </Flex>

      <Flex direction="row" spacing={4}>
        <Button type="submit" isLoading={formState.isSubmitting}>
          {intl.formatMessage({ id: isNew ? 'btn_create' : 'global.save' })}
        </Button>
        {!isNew && isDeletable ? (
          <DeleteMenuItemConfirmationModal
            title={String(watch(getTitleFieldName(defaultLocale.code)) ?? '')}
            menuItemId={menuItemId}
            hasChildren={hasChildren}
          />
        ) : null}
        <Button
          variant="tertiary"
          variantColor="hierarchy"
          onClick={() => (window.location.href = '/admin-next/menu-items')}
        >
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
      </Flex>
    </Flex>
  )
}

export default MenuItemForm
