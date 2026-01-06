import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import {
  FormValues,
  getInitialValues,
  isValid,
  MAX_DESC_LENGTH,
  MAX_HIGHLIGHTED_DESC_LENGTH,
  MAX_HIGHLIGHTED_TITLE_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_TITLE_LENGTH,
  SectionType,
} from '@components/BackOffice/Sections/Carrousel/Carrousel.utils'
import CarrouselContent from '@components/BackOffice/Sections/Carrousel/CarrouselContent'
import CarrouselParameters from '@components/BackOffice/Sections/Carrousel/CarrouselParameters'
import debounce from '@shared/utils/debounce-promise'
import { mutationErrorToast } from '@shared/utils/toasts'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { FC, Suspense, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { SectionIdCarrouselQuery } from '@relay/SectionIdCarrouselQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import CreateOrUpdateCarrouselConfigurationMutation from '@mutations/CreateOrUpdateCarrouselConfigurationMutation'

const formName = 'carousel_section_configuration_form'

export const QUERY = graphql`
  query SectionIdCarrouselQuery($type: String = "carrousel") {
    ...CarrouselParameters_query
    carrouselConfiguration(type: $type) {
      position
      title
      enabled
      isLegendEnabledOnImage
      carrouselElements {
        edges {
          node {
            id
            title
            position
            description
            isDisplayed
            buttonLabel
            type
            redirectLink
            image {
              id
              url(format: "reference")
              type: contentType
            }
            startAt
            endAt
          }
        }
      }
    }
  }
`

export const HomePageCarrouselSectionConfigurationPage: FC<{ type?: SectionType }> = ({ type = 'carrousel' }) => {
  const query = useLazyLoadQuery<SectionIdCarrouselQuery>(QUERY, { type })
  const { carrouselConfiguration } = query

  const intl = useIntl()
  const { setSaving: triggerNavBarSaving, setBreadCrumbItems } = useNavBarContext()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(carrouselConfiguration),
  })

  const { handleSubmit, watch, reset, setValue } = methods

  const preventReSubmit = watch('preventReSubmit')
  const title = watch('title')

  useEffect(() => {
    setBreadCrumbItems([
      {
        title: `${intl.formatMessage({ id: 'admin.group.pages' })} > ${intl.formatMessage({
          id: 'admin.label.section',
        })}`,
        href: '/admin/capco/app/section/list',
      },
      {
        title: intl.formatMessage({
          id: type === 'carrousel' ? 'global.scrolling-header' : title ? title : 'global.title',
        }),
        href: '',
      },
    ])
    return () => setBreadCrumbItems([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  useEffect(() => {
    if (preventReSubmit) setValue('preventReSubmit', false)
  }, [preventReSubmit, setValue])

  const onSubmit = (values: FormValues) => {
    delete values.preventReSubmit
    if (!isValid(values, type)) return
    setIsSubmitting(true)
    CreateOrUpdateCarrouselConfigurationMutation.commit({
      input: {
        type,
        ...values,
        title: type === 'carrousel' ? undefined : values.title,
        position: parseInt(values.position),
        carrouselElements: values.carrouselElements.map((element, position) => ({
          ...element,
          title: element.title?.slice(0, type === 'carrousel' ? MAX_TITLE_LENGTH : MAX_HIGHLIGHTED_TITLE_LENGTH),
          description: element.description?.slice(
            0,
            type === 'carrousel' ? MAX_DESC_LENGTH : MAX_HIGHLIGHTED_DESC_LENGTH,
          ),
          buttonLabel: element.buttonLabel?.slice(0, MAX_LABEL_LENGTH),
          position,
          image: element.image?.id,
          defaultIsOpen: undefined,
          startAt: type === 'carrousel' ? undefined : element.startAt,
          endAt: type === 'carrousel' ? undefined : element.endAt,
        })),
      },
    })
      .then(({ createOrUpdateCarrouselConfiguration }) => {
        if (createOrUpdateCarrouselConfiguration?.errorCode || !createOrUpdateCarrouselConfiguration) {
          mutationErrorToast(intl)
          return setIsSubmitting(false)
        } else {
          const { carrouselConfiguration } = createOrUpdateCarrouselConfiguration
          const newItem = carrouselConfiguration.carrouselElements.edges.filter(
            o1 => !values.carrouselElements.some(o2 => o1.node.id === o2.id),
          )
          reset(getInitialValues(carrouselConfiguration, newItem?.length ? newItem[0]?.node?.id : null))
          return setIsSubmitting(false)
        }
      })
      .catch(() => {
        mutationErrorToast(intl)
        return setIsSubmitting(false)
      })
  }

  useEffect(() => {
    if (!isSubmitting) setTimeout(() => triggerNavBarSaving(isSubmitting), 1000)
    else triggerNavBarSaving(isSubmitting)
  }, [isSubmitting, triggerNavBarSaving])

  // onChange validation. If we have an invalid value somewhere we don't submit
  useEffect(() => {
    watch((values: FormValues, { name }) => {
      if (name === 'preventReSubmit') return null
      if (isValid(values, type)) onValidFormChange(values)
      return null
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch])

  const onValidFormChange = useMemo(
    () =>
      debounce((values: FormValues) => {
        onSubmit(values)
      }, 1500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <Flex
      as="form"
      id={formName}
      onSubmit={handleSubmit(onSubmit)}
      direction="column"
      alignItems="flex-start"
      spacing={6}
    >
      <FormProvider {...methods}>
        <Flex direction="row" width="100%" spacing={6}>
          <Flex direction="column" spacing={6} width="70%">
            <Flex p={8} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion">
              <CarrouselContent
                title={type === 'carrouselHighlighted' ? carrouselConfiguration.title : null}
                type={type}
              />
            </Flex>
          </Flex>
          <CarrouselParameters type={type} query={query} />
        </Flex>
      </FormProvider>
    </Flex>
  )
}

const PageWithLayout = () => {
  return (
    <Layout navTitle="">
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <HomePageCarrouselSectionConfigurationPage />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default PageWithLayout
