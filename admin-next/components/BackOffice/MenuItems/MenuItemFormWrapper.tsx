import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import '@shared/utils/yupExtensions'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import CreateMenuItemMutation from '@mutations/CreateMenuItemMutation'
import UpdateMenuItemMutation from '@mutations/UpdateMenuItemMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { formatCodeToLocale } from '@utils/locale-helper'
import type { MenuItemFormWrapperQuery } from '@relay/MenuItemFormWrapperQuery.graphql'
import { Locale, MenuItemFormValues } from './MenuItem.type'
import MenuItemForm from './MenuItemForm'
import { getLinkFieldName, getTitleFieldName } from './utils'

export const QUERY: GraphQLTaggedNode = graphql`
  query MenuItemFormWrapperQuery($id: ID!, $isEdition: Boolean!) {
    menuItem(id: $id) @include(if: $isEdition) {
      id
      menu
      position
      isEnabled
      isDeletable
      isFullyModifiable
      isExternalLink
      hasChildren
      parent {
        id
      }
      page {
        id
        title
      }
      translations {
        locale
        title
        link
      }
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
    menuItemParents {
      id
      translations {
        locale
        title
        link
      }
    }
    pages {
      id
      title
      isEnabled
    }
  }
`

// Length of the title and link columns of a menu item translation
const MAX_LENGTH = 255

type Props = {
  menuItemId: string | null
}

const MenuItemFormWrapper = ({ menuItemId }: Props): JSX.Element => {
  const intl = useIntl()
  const isNew = !menuItemId
  const { menuItem, availableLocales, menuItemParents, pages } = useLazyLoadQuery<MenuItemFormWrapperQuery>(QUERY, {
    id: menuItemId ?? '',
    isEdition: !isNew,
  })
  const locales = availableLocales as ReadonlyArray<Locale>
  const defaultLocale = locales.find(locale => locale.isDefault) ?? locales[0]
  // The link of a mandatory item cannot be changed: a missing translation inherits the default locale link
  const isLinkLocked = Boolean(menuItem && !menuItem.isFullyModifiable)

  const defaultValues = React.useMemo(() => {
    const translations = menuItem?.translations ?? []
    const findTranslation = (code: string) =>
      translations.find(translation => translation.locale === formatCodeToLocale(code))
    const defaultLink = findTranslation(defaultLocale.code)?.link ?? ''
    const values: MenuItemFormValues = {
      menu: menuItem?.menu === 'FOOTER' ? 'FOOTER' : 'HEADER',
      parent: menuItem?.parent?.id ?? '',
      page: menuItem?.page?.id ?? '',
      position: menuItem?.position ?? '',
      isEnabled: menuItem?.isEnabled ?? true,
      isExternalLink: menuItem?.isExternalLink ?? false,
    }
    locales.forEach(({ code }) => {
      const translation = findTranslation(code)
      values[getTitleFieldName(code)] = translation?.title ?? ''
      values[getLinkFieldName(code)] = translation?.link || (isLinkLocked ? defaultLink : '')
    })
    return values
  }, [menuItem, locales, defaultLocale, isLinkLocked])

  const requiredMessage = intl.formatMessage({ id: 'global.required' })
  const maxLengthMessage = intl.formatMessage({ id: 'characters-maximum-required' }, { length: MAX_LENGTH })
  const translationFields: Record<string, yup.StringSchema> = {}
  locales.forEach(({ code }) => {
    const titleSchema = yup.string().max(MAX_LENGTH, maxLengthMessage)
    translationFields[getTitleFieldName(code)] =
      code === defaultLocale.code
        ? titleSchema.notBlank(requiredMessage)
        : // Other locales are optional, but a link cannot be displayed without title
          titleSchema.test('required-with-link', requiredMessage, function (value) {
            const link = String(this.parent[getLinkFieldName(code)] ?? '').trim()
            const isLinkEditable = !isLinkLocked && !this.parent.page
            return !isLinkEditable || link === '' || String(value ?? '').trim() !== ''
          })
    // The link is not sent when a custom page provides it
    translationFields[getLinkFieldName(code)] = yup.string().test('max-length', maxLengthMessage, function (value) {
      return Boolean(this.parent.page) || String(value ?? '').trim().length <= MAX_LENGTH
    })
  })
  const schema = yup.object().shape({
    ...translationFields,
    menu: yup.string().required(requiredMessage),
    position: yup.number().typeError(requiredMessage).required(requiredMessage),
  })

  const methods = useForm<MenuItemFormValues>({
    defaultValues,
    resolver: yupResolver(schema),
  })

  const isNotFound = !isNew && !menuItem

  React.useEffect(() => {
    // Unknown or deleted item: back to the list rather than an empty edition form
    if (isNotFound) window.location.href = '/admin-next/menu-items'
  }, [isNotFound])

  const title = methods.watch(getTitleFieldName(defaultLocale.code)) as string
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(
    () => [
      { title: intl.formatMessage({ id: 'admin.label.menu_item' }), href: '/admin-next/menu-items' },
      {
        title: title || intl.formatMessage({ id: 'admin.menu-items.new' }),
        href: menuItemId ? `menu-item?id=${menuItemId}` : 'menu-item',
      },
    ],
    [intl, title, menuItemId],
  )

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  const onSubmit = async (values: MenuItemFormValues) => {
    // Every locale is sent: an emptied title removes the translation of an optional locale
    const translations = locales.map(({ code }) => ({
      locale: code,
      title: String(values[getTitleFieldName(code)] ?? ''),
      link: values.page ? null : String(values[getLinkFieldName(code)] ?? ''),
    }))
    const input = {
      translations,
      menu: values.menu,
      position: Number(values.position),
      isEnabled: Boolean(values.isEnabled),
      isExternalLink: Boolean(values.isExternalLink),
      parent: values.menu === 'HEADER' && values.parent ? values.parent : null,
      page: values.page || null,
    }

    try {
      if (isNew) {
        const response = await CreateMenuItemMutation.commit({ input })
        if (response.createMenuItem?.errorCode || !response.createMenuItem?.menuItem) {
          return mutationErrorToast(intl)
        }
        successToast(intl.formatMessage({ id: 'admin.menu-items.successfully-created' }))
        window.location.href = `/admin-next/menu-item?id=${response.createMenuItem.menuItem.id}`
        return
      }

      const response = await UpdateMenuItemMutation.commit({ input: { ...input, id: menuItemId } })
      if (response.updateMenuItem?.errorCode) return mutationErrorToast(intl)
      successToast(intl.formatMessage({ id: 'admin.update.successful' }))
    } catch {
      mutationErrorToast(intl)
    }
  }

  // A sub menu cannot hold sub menus, so the item itself is not a valid parent
  const parentOptions = menuItemParents
    .filter(parent => parent.id !== menuItemId)
    .map(parent => {
      const translation =
        parent.translations.find(({ locale }) => locale === intl.locale) ??
        parent.translations.find(({ locale }) => locale === formatCodeToLocale(defaultLocale.code)) ??
        parent.translations[0]
      return { value: parent.id, label: translation?.title ?? '' }
    })
  // Unpublished pages cannot be selected, except the one already linked
  const pageOptions = pages
    .filter(page => page.isEnabled || page.id === menuItem?.page?.id)
    .map(page => ({ value: page.id, label: page.title ?? '' }))

  if (isNotFound) return null

  return (
    <FormProvider {...methods}>
      <MenuItemForm
        menuItemId={menuItemId}
        isDeletable={Boolean(menuItem?.isDeletable)}
        hasChildren={Boolean(menuItem?.hasChildren)}
        isLinkLocked={isLinkLocked}
        locales={locales}
        defaultLocale={defaultLocale}
        parentOptions={parentOptions}
        pageOptions={pageOptions}
        onSubmit={onSubmit}
      />
    </FormProvider>
  )
}

export default MenuItemFormWrapper
