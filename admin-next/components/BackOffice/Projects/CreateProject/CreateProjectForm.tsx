import React, { useEffect, useRef } from 'react'
import { Box, Button, CapUIFontSize, FormLabel, Text, toast } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { graphql, useFragment } from 'react-relay'
import UserListField from '../../Form/UserListField'
import formatSubmitted from '@utils/format-submitted'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import CreateProjectMutation from '@mutations/CreateProjectMutation'
import { CreateProjectForm_viewer$key } from '@relay/CreateProjectForm_viewer.graphql'
import { useNavBarContext } from '../../NavBar/NavBar.context'
import { getParticipatoryBudgetInput } from './ConfigureParticipatoryBudgetInput'
import { getParticipatoryBudgetAnalysisInput } from './ConfigureParticipatoryBudgetAnalysisInput'
import { getPublicInquiryInput } from './ConfigurePublicInquiryInput'
import PreConfigureProjectMutation from '@mutations/PreConfigureProjectMutation'
import { CreateProjectMutation$data } from '@relay/CreateProjectMutation.graphql'
import { PreConfigureProjectMutation$data, ProjectVisibility } from '@relay/PreConfigureProjectMutation.graphql'

type ParticipatoryBudget = 'PARTICIPATORY_BUDGET'

type ParticipatoryBudgetAnalysis = 'PARTICIPATORY_BUDGET_ANALYSIS'

type PublicInquiry = 'PUBLIC_INQUIRY'

type Props = {
  viewer: CreateProjectForm_viewer$key
  setShowHelpMessage: (showHelpMessage: boolean) => void
}

type ProjectResponse = { adminAlphaUrl: string } | null | undefined

type Mutation$data = CreateProjectMutation$data | PreConfigureProjectMutation$data | null

type FormValues = {
  title: string
  authors: Array<{ label: string; value: string }>
  model: ParticipatoryBudget | ParticipatoryBudgetAnalysis | PublicInquiry | null
}

const VIEWER_FRAGMENT = graphql`
  fragment CreateProjectForm_viewer on User {
    __typename
    id
    username
    isOnlyProjectAdmin
    isAdmin
    isSuperAdmin
    organizations {
      __typename
      id
      username
    }
  }
`
const CreateProjectForm: React.FC<Props> = ({ viewer: viewerFragment, setShowHelpMessage }) => {
  const intl = useIntl()
  const isNewBackOfficeEnabled = useFeatureFlag('unstable__new_create_project')

  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const { setSaving: triggerNavBarSaving, setBreadCrumbItems } = useNavBarContext()

  const inputTitleRef = useRef<HTMLInputElement | null>(null)

  const { isOnlyProjectAdmin, isAdmin, isSuperAdmin } = viewer
  const organization = viewer?.organizations?.[0]
  const owner = organization ?? viewer

  const modelOptions = [
    {
      value: 'PARTICIPATORY_BUDGET',
      label: intl.formatMessage({ id: 'project.types.participatoryBudgeting' }),
    },
    {
      value: 'PARTICIPATORY_BUDGET_ANALYSIS',
      label: intl.formatMessage({ id: 'project.types.participatoryBudgetingAnalysis' }),
    },
    {
      value: 'PUBLIC_INQUIRY',
      label: intl.formatMessage({ id: 'project.types.publicInquiry' }),
    },
    {
      value: 'NONE',
      label: intl.formatMessage({ id: 'no-model' }),
    },
  ]

  const initialValues: FormValues = {
    title: '',
    authors: [
      {
        label: organization?.username ?? viewer.username ?? '',
        value: owner.id,
      },
    ],
    model: null,
  }

  const { handleSubmit, formState, control, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: initialValues,
  })

  const { isValid, isSubmitting } = formState

  const title = watch('title')
  const breadCrumbItems = [
    {
      title: intl.formatMessage({ id: 'global.all.projects' }),
      href: '/projects',
    },
    {
      title: title || intl.formatMessage({ id: 'new-project' }),
      href: '/',
    },
  ]

  useEffect(() => {
    setBreadCrumbItems(breadCrumbItems)
    return () => setBreadCrumbItems([])
  }, [setBreadCrumbItems, title])

  useEffect(() => {
    triggerNavBarSaving(isSubmitting)
  }, [isSubmitting])

  useEffect(() => {
    if (inputTitleRef.current) {
      inputTitleRef.current.focus()
    }
  }, [])

  const onSubmit = async (values: FormValues) => {
    const authors = formatSubmitted(values.authors)
    const title = values.title

    let response: Mutation$data
    let project: ProjectResponse

    try {
      switch (values.model) {
        case 'PARTICIPATORY_BUDGET':
          const participatoryBudgetInput = getParticipatoryBudgetInput({
            projectTitle: title,
            authors,
            intl,
            isNewBackOfficeEnabled,
          })

          response = await PreConfigureProjectMutation.commit({
            input: participatoryBudgetInput,
          })
          project = response.preConfigureProject?.project
          break
        case 'PARTICIPATORY_BUDGET_ANALYSIS':
          const participatoryBudgetAnalysisInput = getParticipatoryBudgetAnalysisInput({
            projectTitle: title,
            authors,
            intl,
            isNewBackOfficeEnabled,
          })

          response = await PreConfigureProjectMutation.commit({
            input: participatoryBudgetAnalysisInput,
          })
          project = response.preConfigureProject?.project
          break
        case 'PUBLIC_INQUIRY':
          const publicInquiryInput = getPublicInquiryInput({
            projectTitle: title,
            authors,
            intl,
            isNewBackOfficeEnabled,
            visibility: isAdmin || isSuperAdmin ? ('ADMIN' as ProjectVisibility) : ('ME' as ProjectVisibility),
          })

          response = await PreConfigureProjectMutation.commit({
            input: publicInquiryInput,
          })
          project = response.preConfigureProject?.project
          break
        default:
          const input = {
            title,
            authors,
            owner: owner.id,
          }
          response = await CreateProjectMutation.commit({ input, connections: [] })
          project = response?.createProject?.project
      }
    } catch {
      return mutationErrorToast(intl)
    }

    if (!project) return mutationErrorToast(intl)

    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'project-successfully-created' }),
    })

    const adminUrl = project.adminAlphaUrl
    if (adminUrl) {
      window.location.href = adminUrl
    }
  }

  return (
    <Box>
      <Box maxWidth="437px">
        <Text color="blue.900" fontSize={CapUIFontSize.DisplaySmall} fontWeight={600} mb={4}>
          {intl.formatMessage({ id: 'customize-your-new-project' })}
        </Text>
        <Text color="blue.900" fontSize={CapUIFontSize.Headline} fontWeight={400} width="100%">
          {intl.formatMessage({ id: 'create-project-help-text' })}
        </Text>
        <Box mt={5} as="form" onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="title" control={control} isRequired variantColor="hierarchy">
            <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.project.name' })} />
            <FieldInput
              ref={inputTitleRef}
              data-cy="create-project-modal-title"
              id="title"
              name="title"
              control={control}
              type="text"
              onFocus={() => {
                setShowHelpMessage(true)
              }}
              onBlur={() => {
                setShowHelpMessage(false)
              }}
            />
          </FormControl>
          <FormControl
            variantColor="hierarchy"
            name="authors"
            control={control}
            isRequired
            isDisabled={isOnlyProjectAdmin || !!organization}
            data-cy="create-project-modal-authors"
          >
            <FormLabel htmlFor="authors" label={intl.formatMessage({ id: 'project.owner' })} />
            <UserListField name="authors" control={control} isMulti />
          </FormControl>
          <FormControl name="model" control={control} variantColor="hierarchy">
            <FormLabel htmlFor="model" label={intl.formatMessage({ id: 'global.model' })}>
              <Text color="gray.500">{intl.formatMessage({ id: 'global.optional' })}</Text>
            </FormLabel>
            <FieldInput
              name="model"
              control={control}
              options={modelOptions}
              type="select"
              clearable
              placeholder={intl.formatMessage({
                id: 'create-project.placeholder_model',
              })}
            />
          </FormControl>
          <Button
            data-cy="create-project-create-button"
            mt={5}
            variant="primary"
            variantColor="primary"
            variantSize="big"
            mr={8}
            type="submit"
            isLoading={isSubmitting}
            disabled={!isValid}
          >
            {intl.formatMessage({ id: 'lets-go' })}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateProjectForm
