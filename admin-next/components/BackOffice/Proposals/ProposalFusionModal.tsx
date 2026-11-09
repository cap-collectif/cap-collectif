import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, ButtonGroup, CapUIModalSize, Flex, FormGuideline, FormLabel, Heading, Modal } from '@cap-collectif/ui'
import { yupResolver } from '@hookform/resolvers/yup'
import CreateProposalFusionMutation from '@mutations/CreateProposalFusionMutation'
import type { ProposalFusionModalProjectsQuery } from '@relay/ProposalFusionModalProjectsQuery.graphql'
import type { ProposalFusionModalProposalsQuery } from '@relay/ProposalFusionModalProposalsQuery.graphql'
import { VARCHAR_MAX_LENGTH } from '@shared/constants/fieldLength'
import '@shared/utils/yupExtensions'
import { mutationErrorToast } from '@shared/utils/toasts'
import { environment } from '@utils/relay-environement'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'
import { fetchQuery, graphql } from 'react-relay'
import * as yup from 'yup'

const PROJECTS_QUERY = graphql`
  query ProposalFusionModalProjectsQuery($term: String) {
    projects(term: $term) {
      edges {
        node {
          id
          title
          steps {
            __typename
            id
          }
        }
      }
    }
  }
`

const PROPOSALS_QUERY = graphql`
  query ProposalFusionModalProposalsQuery($stepId: ID!, $term: String) {
    step: node(id: $stepId) {
      ... on CollectStep {
        proposals(first: 10, term: $term) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`

type Option = { value: string; label: string }
type ProjectOption = Option & { collectStepId: string }

type FormValues = {
  project: ProjectOption | null
  fromProposals: Option[]
  title: string
}

const getSchema = (intl: IntlShape) =>
  yup.object({
    project: yup
      .object()
      .nullable()
      .required(intl.formatMessage({ id: 'please-select-a-participatory-project' })),
    fromProposals: yup.array().min(2, intl.formatMessage({ id: 'please-select-at-least-2-proposals' })),
    // The fusion form skips the Symfony validation: a longer title would fail on the proposal title column
    title: yup
      .string()
      .notBlank(intl.formatMessage({ id: 'global.required' }))
      .max(
        VARCHAR_MAX_LENGTH,
        intl.formatMessage({ id: 'characters-maximum-required' }, { length: VARCHAR_MAX_LENGTH }),
      ),
  })

// Only the projects with a collect step can merge proposals, as in the former Sonata list
const loadProjects = async (term: string): Promise<ProjectOption[]> => {
  const data = await fetchQuery<ProposalFusionModalProjectsQuery>(environment, PROJECTS_QUERY, {
    term: term || null,
  }).toPromise()

  return (data?.projects.edges ?? []).flatMap(edge => {
    const collectStep = edge?.node?.steps.find(step => step.__typename === 'CollectStep')
    return edge?.node && collectStep
      ? [{ value: edge.node.id, label: edge.node.title, collectStepId: collectStep.id }]
      : []
  })
}

// Rendered inside the Modal render-prop: CapUI unmounts it on close, so the form restarts empty at each opening
const ProposalFusionForm: React.FC<{ hide: () => void }> = ({ hide }) => {
  const intl = useIntl()
  const formId = React.useId()
  const { control, handleSubmit, formState, setValue, watch } = useForm<FormValues>({
    defaultValues: { project: null, fromProposals: [], title: '' },
    resolver: yupResolver(getSchema(intl)),
  })
  const collectStepId = watch('project')?.collectStepId

  const loadProposals = async (term: string): Promise<Option[]> => {
    if (!collectStepId) return []

    const data = await fetchQuery<ProposalFusionModalProposalsQuery>(environment, PROPOSALS_QUERY, {
      stepId: collectStepId,
      term: term || null,
    }).toPromise()

    return (data?.step?.proposals?.edges ?? []).flatMap(edge =>
      edge?.node ? [{ value: edge.node.id, label: edge.node.title }] : [],
    )
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await CreateProposalFusionMutation.commit({
        input: { fromProposals: values.fromProposals.map(proposal => proposal.value), title: values.title.trim() },
      })
      const createdProposal = response.createProposalFusion?.proposal
      if (!createdProposal) return mutationErrorToast(intl)

      hide()
      if (createdProposal.adminUrl) window.location.href = createdProposal.adminUrl
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <>
      <Modal.Body direction="column">
        {/* noValidate: let yup display the translated errors instead of the browser's native tooltip */}
        <Flex as="form" id={formId} direction="column" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormControl name="project" control={control} isRequired>
            <FormLabel htmlFor="project" label={intl.formatMessage({ id: 'global.participative.project.label' })} />
            <FieldInput
              id="project"
              name="project"
              control={control}
              type="select"
              defaultOptions
              loadOptions={loadProjects}
              placeholder={intl.formatMessage({ id: 'select-a-participatory-project' })}
              // The initial proposals belong to the collect step of the selected project
              onChange={() => setValue('fromProposals', [])}
            />
          </FormControl>
          {collectStepId ? (
            <FormControl name="fromProposals" control={control} isRequired>
              <FormLabel htmlFor="fromProposals" label={intl.formatMessage({ id: 'initial-proposals' })} />
              <FormGuideline>{intl.formatMessage({ id: '2-proposals-minimum' })}</FormGuideline>
              <FieldInput
                // Remounts the select so that its default options are those of the selected project
                key={collectStepId}
                id="fromProposals"
                name="fromProposals"
                control={control}
                type="select"
                isMulti
                defaultOptions
                loadOptions={loadProposals}
                placeholder={intl.formatMessage({ id: 'select-proposals' })}
              />
            </FormControl>
          ) : null}
          <FormControl name="title" control={control} isRequired>
            <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
            <FieldInput id="title" name="title" control={control} type="text" maxLength={VARCHAR_MAX_LENGTH} />
          </FormControl>
        </Flex>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <ButtonGroup>
          <Button variant="secondary" variantColor="hierarchy" variantSize="medium" onClick={hide}>
            {intl.formatMessage({ id: 'global.cancel' })}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            variantColor="primary"
            variantSize="medium"
            isLoading={formState.isSubmitting}
          >
            {intl.formatMessage({ id: 'create-a-new-proposal' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  )
}

const ProposalFusionModal: React.FC<{ disclosure: React.ReactElement }> = ({ disclosure }) => {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'admin.proposals.merge' })

  return (
    <Modal ariaLabel={title} size={CapUIModalSize.Md} disclosure={disclosure}>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{title}</Heading>
          </Modal.Header>
          <ProposalFusionForm hide={hide} />
        </>
      )}
    </Modal>
  )
}

export default ProposalFusionModal
