import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import '@shared/utils/yupExtensions'
import { Flex } from '@cap-collectif/ui'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import CreatePageMutation from '@mutations/CreatePageMutation'
import UpdatePageMutation from '@mutations/UpdatePageMutation'
import type { TranslationLocale } from '@relay/UpdatePageMutation.graphql'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { formatLocaleToCode } from '@utils/locale-helper'
import { CustomPageFormWrapperQuery, CustomPageFormWrapperQuery$data } from '@relay/CustomPageFormWrapperQuery.graphql'
import { CustomPageFormWrapper_ViewerQuery } from '@relay/CustomPageFormWrapper_ViewerQuery.graphql'
import { CustomPageFormValues, Locale } from './CustomPage.type'
import CustomPageForm from './CustomPageForm'
import CustomPageFormSide from './CustomPageFormSide'

type CustomPageFormWrapperProps = {
  pageId?: string
  pageData?: CustomPageFormWrapperQuery$data
}

type CustomPageFormWrapperWithDataProps = {
  pageId: string
}

export const QUERY: GraphQLTaggedNode = graphql`
  query CustomPageFormWrapperQuery($id: ID!) {
    customPage(id: $id) {
      id
      url
      isEnabled
      customCode
      cover {
        id
        name
        size
        type: contentType
        url(format: "reference")
      }
      translations {
        locale
        title
        body
        metaDescription
      }
    }
  }
`

export const VIEWER_QUERY = graphql`
  query CustomPageFormWrapper_ViewerQuery {
    platformLocales: availableLocales(includeDisabled: false) {
      code
      id
      isDefault
      traductionKey
    }
  }
`

const formName = 'admin_custom_page'

const TRANSLATED_FIELDS = ['title', 'body', 'metaDescription'] as const

const CustomPageFormWrapper = ({ pageId, pageData }: CustomPageFormWrapperProps): JSX.Element => {
  const intl = useIntl()
  const isNewPage = !pageId
  const [isLoading, setIsLoading] = React.useState(false)
  const { platformLocales } = useLazyLoadQuery<CustomPageFormWrapper_ViewerQuery>(VIEWER_QUERY, {})
  const defaultLocale = platformLocales.find(locale => locale.isDefault) ?? platformLocales[0]
  const [currentLocale, setCurrentLocale] = React.useState<string>(defaultLocale.code)
  const page = pageData?.customPage

  const defaultValues = React.useMemo(() => {
    const values: CustomPageFormValues = {
      isEnabled: page?.isEnabled ?? true,
      cover: page?.cover ?? null,
      customCode: page?.customCode ?? '',
    }
    platformLocales.forEach(locale => {
      TRANSLATED_FIELDS.forEach(field => {
        values[`${locale.code}-${field}`] = ''
      })
    })
    // Translations are exposed with an IETF locale (fr-FR) while form fields use the enum code (FR_FR).
    page?.translations.forEach(translation => {
      const code = formatLocaleToCode(translation.locale)
      values[`${code}-title`] = translation.title ?? ''
      values[`${code}-body`] = translation.body ?? ''
      values[`${code}-metaDescription`] = translation.metaDescription ?? ''
    })

    return values
  }, [page, platformLocales])

  const schema = React.useMemo(() => {
    const requiredMessage = intl.formatMessage({ id: 'global.required' })
    const localeFields: Record<string, yup.AnySchema> = {}

    platformLocales.forEach(locale => {
      if (locale.code === defaultLocale.code) {
        localeFields[`${locale.code}-title`] = yup.string().notBlank(requiredMessage)
        localeFields[`${locale.code}-body`] = yup
          .string()
          .test('not-empty', requiredMessage, value => !isWYSIWYGContentEmpty(value ?? ''))
        return
      }
      // Other locales are optional, but a started translation needs a title to be saved.
      localeFields[`${locale.code}-title`] = yup
        .string()
        .test('required-if-translated', requiredMessage, function (value) {
          const hasContent =
            !isWYSIWYGContentEmpty(this.parent[`${locale.code}-body`] ?? '') ||
            Boolean(this.parent[`${locale.code}-metaDescription`]?.trim())

          return !hasContent || Boolean(value?.trim())
        })
    })

    return yup.object().shape(localeFields)
  }, [intl, platformLocales, defaultLocale.code])

  const methods = useForm<CustomPageFormValues>({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  })

  const { watch, getValues } = methods
  const title = watch(`${defaultLocale.code}-title`) as string
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'admin.label.page' }),
        href: '/admin-next/custom-pages',
      },
      {
        title: title || intl.formatMessage({ id: 'admin.custom-pages.new' }),
        href: pageId ? `custom-page?id=${pageId}` : 'custom-page',
      },
    ],
    [intl, title, pageId],
  )

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  const formatTranslations = () =>
    platformLocales
      .map(locale => {
        const localeTitle = String(getValues(`${locale.code}-title`) ?? '').trim()
        const localeBody = String(getValues(`${locale.code}-body`) ?? '')
        const localeMetaDescription = String(getValues(`${locale.code}-metaDescription`) ?? '').trim()

        return {
          locale: locale.code,
          title: localeTitle,
          body: isWYSIWYGContentEmpty(localeBody) ? null : localeBody,
          metaDescription: localeMetaDescription || null,
        }
      })
      .filter(translation => translation.title !== '')

  // The API keeps translations missing from the payload, so an emptied translation must be deleted explicitly.
  // The schema only allows an empty title when the whole translation is empty.
  const getDeletedTranslationLocales = (): TranslationLocale[] =>
    (page?.translations ?? [])
      .map(translation => formatLocaleToCode(translation.locale) as TranslationLocale)
      .filter(code => code !== defaultLocale.code && !String(getValues(`${code}-title`) ?? '').trim())

  const onSubmit = (data: CustomPageFormValues) => {
    setIsLoading(true)

    const input = {
      isEnabled: data.isEnabled,
      cover: data.cover?.id ?? null,
      customCode: data.customCode || null,
      translations: formatTranslations(),
    }

    if (isNewPage) {
      CreatePageMutation.commit({ input })
        .then(response => {
          if (response.createPage?.errorCode) {
            dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
            setIsLoading(false)
            return
          }
          successToast(intl.formatMessage({ id: 'admin.custom-pages.successfully-created' }))
          window.location.href = `custom-page?id=${response.createPage?.page?.id}`
        })
        .catch(() => {
          setIsLoading(false)
          mutationErrorToast(intl)
        })
      return
    }

    UpdatePageMutation.commit({
      input: { ...input, id: pageId, deletedTranslationLocales: getDeletedTranslationLocales() },
    })
      .then(response => {
        setIsLoading(false)
        if (response.updatePage?.errorCode) {
          dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
          return
        }
        successToast(intl.formatMessage({ id: 'admin.update.successful' }))
      })
      .catch(() => {
        setIsLoading(false)
        mutationErrorToast(intl)
      })
  }

  return (
    <Flex as="form" id={formName} direction="column" alignItems="flex-start" spacing={6} noValidate>
      <FormProvider {...methods}>
        <Flex direction="row" width="100%" spacing={6}>
          <Flex direction="column" spacing={6} width="70%">
            <CustomPageForm
              pageId={isNewPage ? null : pageId}
              pageUrl={page?.url ?? null}
              currentLocale={currentLocale}
              defaultLocale={defaultLocale.code}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </Flex>
          <Flex direction="column" spacing={6} width="30%">
            <CustomPageFormSide
              availableLocales={platformLocales as Locale[]}
              currentLocale={currentLocale}
              setCurrentLocale={setCurrentLocale}
            />
          </Flex>
        </Flex>
      </FormProvider>
    </Flex>
  )
}

export default CustomPageFormWrapper

export const CustomPageFormWrapperWithData = ({ pageId }: CustomPageFormWrapperWithDataProps): JSX.Element => {
  const pageData = useLazyLoadQuery<CustomPageFormWrapperQuery>(QUERY, { id: pageId })

  return <CustomPageFormWrapper pageData={pageData} pageId={pageId} />
}
