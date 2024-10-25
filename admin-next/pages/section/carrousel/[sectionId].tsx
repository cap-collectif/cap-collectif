import { FC, Suspense, useEffect, useMemo, useState } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import debounce from '@shared/utils/debounce-promise'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import Layout from '@components/Layout/Layout'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import CarrouselContent from '@components/Sections/Carrousel/CarrouselContent'
import {
  FormValues,
  getInitialValues,
  isValid,
  MAX_DESC_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_TITLE_LENGTH,
} from '@components/Sections/Carrousel/Carrousel.utils'
import CarrouselParameters from '@components/Sections/Carrousel/CarrouselParameters'
import { SectionIdCarrouselQuery } from '@relay/SectionIdCarrouselQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import DeleteCarrouselElement from '@mutations/DeleteCarrouselElement'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import CreateOrUpdateCarrouselConfigurationMutation from '@mutations/CreateOrUpdateCarrouselConfigurationMutation'
import { isGlobalId } from '@shared/utils/fromGlobalId'

const formName = 'carousel_section_configuration_form'

export const QUERY = graphql`
  query SectionIdCarrouselQuery {
    carrouselConfiguration {
      position
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
          }
        }
      }
    }
  }
`

export const HomePageCarrouselSectionConfigurationPage: FC = () => {
  const { carrouselConfiguration } = useLazyLoadQuery<SectionIdCarrouselQuery>(QUERY, {})

  const intl = useIntl()
  const { setSaving: triggerNavBarSaving, setBreadCrumbItems } = useNavBarContext()

  useEffect(() => {
    setBreadCrumbItems([
      {
        title: `${intl.formatMessage({ id: 'admin.group.pages' })} > ${intl.formatMessage({
          id: 'admin.label.section',
        })}`,
        href: '/admin/capco/app/section/list',
      },
      {
        title: intl.formatMessage({ id: 'global.carrousel' }),
        href: '',
      },
    ])
    return () => setBreadCrumbItems([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(carrouselConfiguration),
  })

  const { handleSubmit, watch, resetField, reset, setValue } = methods

  const carrouselElements = watch('carrouselElements')
  const preventReSubmit = watch('preventReSubmit')

  useEffect(() => {
    if (preventReSubmit) setValue('preventReSubmit', false)
  }, [preventReSubmit, setValue])

  const onSubmit = (values: FormValues) => {
    delete values.preventReSubmit
    if (!isValid(values)) return
    setIsSubmitting(true)
    CreateOrUpdateCarrouselConfigurationMutation.commit({
      input: {
        ...values,
        carrouselElements: values.carrouselElements.map((element, position) => ({
          ...element,
          title: element.title?.slice(0, MAX_TITLE_LENGTH),
          description: element.description?.slice(0, MAX_DESC_LENGTH),
          buttonLabel: element.buttonLabel?.slice(0, MAX_LABEL_LENGTH),
          position,
          image: element.image?.id,
          defaultIsOpen: undefined,
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
            o1 => !carrouselElements.some(o2 => o1.node.id === o2.id),
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
      if (isValid(values)) onValidFormChange(values)
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

  const onDelete = (id: string) => {
    if (!isGlobalId(id)) {
      resetField('carrouselElements', {
        defaultValue: carrouselElements.filter(e => !!e.id),
      })
      return
    }
    setIsSubmitting(true)
    DeleteCarrouselElement.commit({ input: { id } })
      .then(({ deleteCarrouselElement }) => {
        if (deleteCarrouselElement?.deletedCarrouselElementId) {
          resetField('carrouselElements', {
            defaultValue: carrouselElements.filter(e => e.id !== deleteCarrouselElement.deletedCarrouselElementId),
          })
        } else {
          mutationErrorToast(intl)
          return setIsSubmitting(false)
        }
      })
      .catch(() => {
        mutationErrorToast(intl)
        return setIsSubmitting(false)
      })
  }

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
            <Flex p={6} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion">
              <CarrouselContent onDelete={onDelete} />
            </Flex>
          </Flex>
          <CarrouselParameters />
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
