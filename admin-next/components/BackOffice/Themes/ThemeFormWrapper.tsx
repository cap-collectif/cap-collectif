import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import '@shared/utils/yupExtensions'
import { Button, Flex, Text } from '@cap-collectif/ui'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import CreateThemeMutation from '@mutations/CreateThemeMutation'
import UpdateThemeMutation from '@mutations/UpdateThemeMutation'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import { ThemeFormWrapperQuery, ThemeFormWrapperQuery$data } from '@relay/ThemeFormWrapperQuery.graphql'
import { ThemeFormWrapper_LocalesQuery } from '@relay/ThemeFormWrapper_LocalesQuery.graphql'
import { ThemeStatus } from '@relay/UpdateThemeMutation.graphql'
import { Locale, NO_STATUS, ThemeFormValues } from './Theme.type'
import ThemeForm from './ThemeForm'
import ThemeFormSide from './ThemeFormSide'

type ThemeFormWrapperProps = {
  themeId?: string
  themeData?: ThemeFormWrapperQuery$data
}

type ThemeFormWrapperWithDataProps = {
  themeId: string
}

export const QUERY: GraphQLTaggedNode = graphql`
  query ThemeFormWrapperQuery($id: ID!) {
    theme(id: $id) {
      id
      isEnabled
      position
      status
      customCode
      author {
        id
        displayName
      }
      media {
        id
        name
        size
        type: contentType
        url(format: "reference")
      }
      translations {
        locale
        title
        slug
        teaser
        body
        metaDescription
      }
    }
  }
`

export const LOCALES_QUERY = graphql`
  query ThemeFormWrapper_LocalesQuery {
    platformLocales: availableLocales(includeDisabled: false) {
      code
      id
      isDefault
      traductionKey
    }
  }
`

// Column lengths of theme_translation
const TITLE_MAX_LENGTH = 255
const TEASER_MAX_LENGTH = 255
const META_DESCRIPTION_MAX_LENGTH = 160

const TRANSLATED_FIELDS = ['title', 'slug', 'teaser', 'body', 'metaDescription'] as const
const OPTIONAL_TRANSLATED_FIELDS = ['teaser', 'body', 'metaDescription'] as const

const formName = 'admin_theme_form'

const ThemeFormWrapper = ({ themeId, themeData }: ThemeFormWrapperProps): JSX.Element => {
  const intl = useIntl()
  const isNewTheme = !themeId
  const [isLoading, setIsLoading] = React.useState(false)
  const { platformLocales } = useLazyLoadQuery<ThemeFormWrapper_LocalesQuery>(LOCALES_QUERY, {})
  const availableLocales = platformLocales as Locale[]
  const defaultLocale = availableLocales.find(locale => locale.isDefault) ?? availableLocales[0]
  const [currentLocale, setCurrentLocale] = React.useState<string>(defaultLocale.code)
  const theme = themeData?.theme

  const defaultValues: ThemeFormValues = {
    author: theme?.author ? { label: theme.author.displayName, value: theme.author.id } : null,
    media: theme?.media ?? null,
    isEnabled: theme?.isEnabled ?? true,
    position: theme?.position ?? 0,
    status: theme?.status ?? NO_STATUS,
    customCode: theme?.customCode ?? '',
  }
  // One field per locale, all loaded at mount, so switching language only changes which field is displayed
  availableLocales.forEach(({ code }) => {
    const translation = theme?.translations.find(({ locale }) => locale === code)
    TRANSLATED_FIELDS.forEach(field => {
      defaultValues[`${code}-${field}`] = translation?.[field] ?? ''
    })
  })

  const requiredMessage = intl.formatMessage({ id: 'global.required' })
  const getMaxLengthMessage = (max: number) => intl.formatMessage({ id: 'characters-maximum' }, { quantity: max })

  const schema = React.useMemo(() => {
    const localeFields: Record<string, yup.AnySchema> = {}
    availableLocales.forEach(({ code }) => {
      const title = yup.string().max(TITLE_MAX_LENGTH, getMaxLengthMessage(TITLE_MAX_LENGTH))
      // Outside the default locale, the title is only required once another field of that locale is filled
      localeFields[`${code}-title`] =
        code === defaultLocale.code
          ? title.notBlank(requiredMessage)
          : title.test(
              'required-with-content',
              requiredMessage,
              (value, { parent }) =>
                String(value ?? '').trim() !== '' ||
                OPTIONAL_TRANSLATED_FIELDS.every(field => String(parent[`${code}-${field}`] ?? '').trim() === ''),
            )
      localeFields[`${code}-teaser`] = yup.string().max(TEASER_MAX_LENGTH, getMaxLengthMessage(TEASER_MAX_LENGTH))
      localeFields[`${code}-metaDescription`] = yup
        .string()
        .max(META_DESCRIPTION_MAX_LENGTH, getMaxLengthMessage(META_DESCRIPTION_MAX_LENGTH))
    })

    return yup.object().shape({
      ...localeFields,
      position: yup.number().typeError(requiredMessage).required(requiredMessage),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLocales, defaultLocale.code, intl])

  const methods = useForm<ThemeFormValues>({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  })

  const { watch } = methods
  const title = watch(`${defaultLocale.code}-title`) as string
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'admin.label.theme' }),
        href: '/admin-next/themes',
      },
      {
        title: title || intl.formatMessage({ id: 'admin.themes.new' }),
        href: themeId ? `theme?id=${themeId}` : 'theme',
      },
    ]
  }, [intl, title, themeId])

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  // Every locale is sent: the back-end removes the translation of a locale whose fields are all blank
  const formatTranslations = (data: ThemeFormValues) =>
    availableLocales.map(({ code }) => ({
      locale: code,
      title: String(data[`${code}-title`] ?? ''),
      teaser: String(data[`${code}-teaser`] ?? ''),
      body: String(data[`${code}-body`] ?? ''),
      metaDescription: String(data[`${code}-metaDescription`] ?? ''),
    }))

  const onSubmit = (data: ThemeFormValues) => {
    setIsLoading(true)

    const input = {
      author: data.author?.value ?? null,
      media: data.media?.id ?? null,
      isEnabled: data.isEnabled,
      position: Number(data.position),
      status: data.status === NO_STATUS ? null : (data.status as ThemeStatus),
      customCode: data.customCode,
      translations: formatTranslations(data),
    }

    if (isNewTheme) {
      return CreateThemeMutation.commit({ input })
        .then(response => {
          if (response.createTheme.errorCode) {
            dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
            setIsLoading(false)
            return
          }
          successToast(intl.formatMessage({ id: 'admin.themes.successfully-created' }))
          window.location.href = `theme?id=${response.createTheme.theme?.id}`
        })
        .catch(() => {
          setIsLoading(false)
          mutationErrorToast(intl)
        })
    }

    return UpdateThemeMutation.commit({ input: { ...input, id: themeId } })
      .then(response => {
        setIsLoading(false)
        if (response.updateTheme.errorCode) {
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
    <Flex as="form" id={formName} direction="column" alignItems="flex-start" spacing={6} width="100%">
      <FormProvider {...methods}>
        <Flex direction="row" width="100%" spacing={6}>
          <Flex direction="column" spacing={6} width="70%">
            <ThemeForm
              isNewTheme={isNewTheme}
              themeId={isNewTheme ? null : themeId}
              onSubmit={onSubmit}
              isLoading={isLoading}
              currentLocale={currentLocale}
              defaultLocale={defaultLocale.code}
              setCurrentLocale={setCurrentLocale}
            />
          </Flex>
          <Flex direction="column" spacing={6} width="30%">
            <ThemeFormSide
              availableLocales={availableLocales}
              currentLocale={currentLocale}
              setCurrentLocale={setCurrentLocale}
            />
          </Flex>
        </Flex>
      </FormProvider>
    </Flex>
  )
}

export default ThemeFormWrapper

export const ThemeFormWrapperWithData = ({ themeId }: ThemeFormWrapperWithDataProps): JSX.Element => {
  const intl = useIntl()
  const data = useLazyLoadQuery<ThemeFormWrapperQuery>(QUERY, { id: themeId })

  // An unknown or deleted theme would otherwise open an empty form whose save always fails
  if (!data.theme) {
    return (
      <Flex
        direction="column"
        alignItems="flex-start"
        spacing={4}
        marginTop="48px"
        bg="white"
        borderRadius="accordion"
        p={6}
      >
        <Text>{intl.formatMessage({ id: 'the-page-you-are-looking-for-cant-be-found' })}</Text>
        <Button variant="secondary" variantColor="primary" onClick={() => (window.location.href = 'themes')}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
      </Flex>
    )
  }

  return <ThemeFormWrapper themeData={data} themeId={themeId} />
}
