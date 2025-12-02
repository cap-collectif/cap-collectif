import { Flex } from '@cap-collectif/ui'
import { yupResolver } from '@hookform/resolvers/yup'
import UpdateNewProjectMutation from '@mutations/UpdateNewProjectMutation'
import { ProjectVisibility } from '@relay/CreateProjectMutation.graphql'
import { ProjectConfigFormQuery } from '@relay/ProjectConfigFormQuery.graphql'
import { ProjectConfigForm_project$key } from '@relay/ProjectConfigForm_project.graphql'
import debounce from '@shared/utils/debounce-promise'
import { mutationErrorToast } from '@shared/utils/toasts'
import { useNavBarContext } from 'components/BackOffice/NavBar/NavBar.context'
import moment from 'moment'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import * as yup from 'yup'
import { FormValues, getInitialValues } from './ProjectConfigForm.utils'
import ProjectConfigFormGeneral from './ProjectConfigFormGeneral'
import ProjectConfigFormSide from './ProjectConfigFormSide/ProjectConfigFormSide'
import ProjectConfigFormSteps from './ProjectConfigFormSteps'

export type ProjectConfigFormProps = {
  project: ProjectConfigForm_project$key
}

export const QUERY = graphql`
  query ProjectConfigFormQuery {
    availableLocales(includeDisabled: false) {
      code
      isEnabled
      isDefault
      traductionKey
    }
    ...ProjectConfigFormGeneral_query
    ...ProjectConfigFormSide_query
  }
`

const FRAGMENT = graphql`
  fragment ProjectConfigForm_project on Project {
    id
    title
    description
    publishedAt
    metaDescription
    archived
    authors {
      value: id
      label: username
    }
    type {
      id
    }
    cover {
      id
      name
      size
      type: contentType
      url(format: "reference")
    }
    canEnableProposalStepSplitView
    isProposalStepSplitViewEnabled
    video
    themes {
      value: id
      label: title
    }
    restrictedViewers {
      edges {
        node {
          value: id
          label: title
        }
      }
    }
    address {
      formatted
      json
    }
    districts {
      edges {
        node {
          value: id
          label: name
        }
      }
    }
    firstCollectStep {
      form {
        isGridViewEnabled
        isListViewEnabled
        isMapViewEnabled
      }
    }
    visibility
    publishedAt
    opinionCanBeFollowed
    isExternal
    externalLink
    externalContributionsCount
    externalParticipantsCount
    externalVotesCount
    locale {
      value: id
      label: traductionKey
    }
    url
    steps(excludePresentationStep: true) {
      id
      label
      __typename
    }
    customCode
    ...ProjectConfigFormSide_project
    ...ProjectTabs_project
  }
`

const formName = 'project_config_form'

const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({ project: projectRef }) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<ProjectConfigFormQuery>(QUERY, {})
  const project = useFragment(FRAGMENT, projectRef)
  const { setSaving: triggerNavBarSaving, setBreadCrumbItems } = useNavBarContext()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(project, intl),
    resolver: yupResolver(
      yup.object().shape({
        externalLink: yup.string().when('isExternal', {
          is: (isExternal: boolean) => isExternal === true,
          then: yup.string().required(intl.formatMessage({ id: 'global.required' })),
          otherwise: yup.string().nullable().notRequired(),
        }),
      }),
    ),
  })

  const onSubmit = ({ isExternal, addressText, ...values }: FormValues) => {
    setIsSubmitting(true)
    const input = {
      ...values,
      cover: values?.cover?.id || null,
      steps: values.steps.map(s => s.id),
      themes: values.themes.map(t => t.value),
      authors: values.authors.map(a => a.value),
      districts: values.districts.map(d => d.value),
      restrictedViewerGroups:
        values.visibility.labels[0] === 'CUSTOM' ? values.restrictedViewerGroups.map(r => r.value) : [],
      visibility: values.visibility.labels[0] as ProjectVisibility,
      publishedAt: moment(values.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
      externalLink: isExternal ? values.externalLink : undefined,
      externalParticipantsCount: isExternal ? values.externalParticipantsCount : undefined,
      externalContributionsCount: isExternal ? values.externalContributionsCount : undefined,
      externalVotesCount: isExternal ? values.externalVotesCount : undefined,
      isExternal,
      locale: values.locale?.value || null,
      projectId: project.id,
      addressText: undefined,
      address: values.address && addressText ? JSON.stringify([values.address]) : null,
    }

    return UpdateNewProjectMutation.commit({ input })
      .then(() => {
        setIsSubmitting(false)
      })
      .catch(e => {
        console.error(e)
        mutationErrorToast(intl)
        setIsSubmitting(false)
      })
  }

  const { handleSubmit, getValues, watch, setValue, trigger } = methods

  const title = watch('title')
  const previousPublicationDate = watch('publishedAt')
  const breadCrumbItems = [
    {
      title: intl.formatMessage({ id: 'global.all.projects' }),
      href: '/admin-next/projects',
    },
    {
      title: title || intl.formatMessage({ id: 'new-project' }),
      href: '/',
    },
  ]

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems)
    return () => setBreadCrumbItems([])
  }, [setBreadCrumbItems, title])

  React.useEffect(() => {
    if (!isSubmitting) setTimeout(() => triggerNavBarSaving(isSubmitting), 1000)
    else triggerNavBarSaving(isSubmitting)
  }, [isSubmitting])

  const onValidFormChange = debounce((values: FormValues) => {
    onSubmit(values)
  }, 500)

  React.useEffect(() => {
    watch((value, { name }) => {
      if (
        name === 'visibility' &&
        !value?.restrictedViewerGroups?.length &&
        value?.visibility?.labels?.[0] === 'CUSTOM'
      )
        return
      if (name === 'publishedAt') {
        // When user clicks on native "clear" button on input date, reset date to its latest value
        if (Number.isNaN((value.publishedAt as any)?._i)) {
          setValue('publishedAt', previousPublicationDate)
        }
        if (!value.publishedAt) return
      }
      if (name === 'addressText') return
      if (name === 'isExternal' && value.isExternal) {
        setValue('externalLink', value.externalLink || '', { shouldTouch: true })
        return
      }
      if (value.isExternal && !value.externalLink) {
        trigger('externalLink')
        return
      }

      onValidFormChange(getValues())
    })
  }, [watch])

  return (
    <>
      <Flex
        marginTop="48px"
        as="form"
        id={formName}
        onSubmit={handleSubmit(onSubmit)}
        direction="column"
        alignItems="flex-start"
        width={'100%'}
        spacing={6}
      >
        <FormProvider {...methods}>
          <Flex direction="row" width="100%" spacing={6}>
            <Flex direction="column" spacing={6} width="70%">
              <ProjectConfigFormGeneral query={query} />
              <ProjectConfigFormSteps />
            </Flex>
            <Flex direction="column" spacing={6} width="30%">
              <ProjectConfigFormSide query={query} project={project} />
            </Flex>
          </Flex>
        </FormProvider>
      </Flex>
    </>
  )
}

export default ProjectConfigForm
