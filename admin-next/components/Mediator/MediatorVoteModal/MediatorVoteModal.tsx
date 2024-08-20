import * as React from 'react'
import { useIntl } from 'react-intl'
import { MultiStepModal, CapUIModalSize, toast } from '@cap-collectif/ui'
import SelectProposalsModal from './SelectProposalsModal'
import { FormProvider, useForm } from 'react-hook-form'
import { ConnectionHandler, graphql, useLazyLoadQuery } from 'react-relay'
import { MediatorVoteModal_REQUIREMENTS_Query } from '@relay/MediatorVoteModal_REQUIREMENTS_Query.graphql'
import FillRequirementsModal from './FillRequirementsModal'
import FillOptionalsModal from './FillOptionalsModal'
import AddMediatorVotesMutation from '@mutations/AddMediatorVotesMutation'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { OrderDirection } from '@relay/ParticipantListPaginationQuery.graphql'
import { MediatorVoteModal_EDIT_Query } from '@relay/MediatorVoteModal_EDIT_Query.graphql'
import moment, { Moment } from 'moment'
import UpdateMediatorVotesMutation from '@mutations/UpdateMediatorVotesMutation'

type Props = {
  onClose: () => void
  stepId: string
  participantId?: string
  token?: string
  mediatorId: string
  username: string
  orderBy: OrderDirection
}

export type ParticipantInfos = {
  id: string
  token: string
}

type FormValues = {
  dateOfBirth?: Moment
  firstname?: string
  lastname?: string
  email?: string
  address?: string
  JSONaddress?: string
  phone?: string
  votes: Array<{ value: string; label: string }>
  checkboxes: {
    [requirementId: string]: boolean
  } | null
}

export const REQUIREMENTS_QUERY = graphql`
  query MediatorVoteModal_REQUIREMENTS_Query($stepId: ID!) {
    node(id: $stepId) {
      ... on SelectionStep {
        id
        votesMin
        ...FillRequirementsModal_step
        ...FillOptionalsModal_step
        requirements {
          edges {
            node {
              __typename
            }
          }
        }
      }
    }
  }
`

const MediatorVoteModal = ({
  onClose,
  stepId,
  participantId,
  mediatorId,
  username,
  orderBy,
  defaultValues = {},
}: Props & { defaultValues?: FormValues | {} }) => {
  const intl = useIntl()

  const query = useLazyLoadQuery<MediatorVoteModal_REQUIREMENTS_Query>(REQUIREMENTS_QUERY, { stepId })

  const onSubmit = async ({ votes, ...data }: FormValues) => {
    const connectionName = ConnectionHandler.getConnectionID(mediatorId, 'ParticipantList_participants', {
      firstname: username || undefined,
      orderBy: { field: 'CREATED_AT', direction: orderBy },
    })

    const postalAddress = () => {
      const JSONaddress = data.JSONaddress

      if (!JSONaddress) {
        return null
      }

      if (typeof JSONaddress === 'string') {
        return JSONaddress
      }

      return JSON.stringify([JSONaddress])
    }

    const participantInfos = {
      dateOfBirth: data.dateOfBirth?.format('YYYY-MM-DD HH:mm:ss') || null,
      firstname: data.firstname || null,
      lastname: data.lastname || null,
      email: data.email || null,
      postalAddress: postalAddress(),
      phone: data.phone || null,
      checkboxes: Object.entries(data.checkboxes ?? {}).map(([requirementId, value]) => {
        return {
          requirementId,
          value: value ?? false,
        }
      }),
    }

    const proposals = votes.map(v => v.value)

    const input = {
      mediatorId,
      proposals,
      participantInfos,
    }

    try {
      if (!participantId) {
        await AddMediatorVotesMutation.commit(
          {
            input: { ...input, stepId },
          },
          connectionName,
        )
      } else {
        await UpdateMediatorVotesMutation.commit({
          input: {
            ...input,
            participantId,
          },
          mediatorId,
        })
      }

      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: participantId ? 'mediator.participant_updated' : 'mediator.participant_added',
        }),
      })
      onClose()
    } catch {
      mutationErrorToast(intl)
      onClose()
    }
  }

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
  })

  if (!query) return null

  const step = query.node
  const votesMin = query.node.votesMin || 1
  const { handleSubmit } = methods

  const showRequiredRequirementsModal = step.requirements.edges
    .map(edge => edge?.node)
    .map(node => node?.__typename)
    .some(typename => {
      return ['PhoneRequirement', 'PhoneVerifiedRequirement', 'EmailVerifiedRequirement'].includes(typename) === false
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <MultiStepModal
          show
          resetStepOnClose
          ariaLabel={intl.formatMessage({ id: 'mediator.new_participant' })}
          size={CapUIModalSize.Xl}
          height="92%"
          hideOnClickOutside={false}
          onClose={onClose}
        >
          <SelectProposalsModal onCancel={onClose} stepId={stepId} isNew={!participantId} votesMin={votesMin} />
          {showRequiredRequirementsModal && <FillRequirementsModal step={step} isNew={!participantId} />}
          <FillOptionalsModal step={step} onSubmit={onSubmit} isNew={!participantId} />
        </MultiStepModal>
      </FormProvider>
    </form>
  )
}

export const EDIT_QUERY = graphql`
  query MediatorVoteModal_EDIT_Query($stepId: ID!, $token: String!, $participantId: ID!, $mediatorId: ID!) {
    step: node(id: $stepId) {
      id
      ... on SelectionStep {
        requirements {
          edges {
            node {
              id
              __typename
              ... on FirstnameRequirement {
                participantValue(token: $token)
              }
              ... on LastnameRequirement {
                participantValue(token: $token)
              }
              ... on DateOfBirthRequirement {
                participantDateOfBirth(token: $token)
              }
              ... on IdentificationCodeRequirement {
                participantValue(token: $token)
              }
              ... on PhoneRequirement {
                participantValue(token: $token)
              }
              ... on PostalAddressRequirement {
                participantAddress(token: $token) {
                  formatted
                  json
                }
              }
              ... on CheckboxRequirement {
                id
                label
                participantMeetsTheRequirement(token: $token)
              }
            }
          }
        }
      }
    }
    participant: node(id: $participantId) {
      ... on Participant {
        id
        email
        votes(mediatorId: $mediatorId) {
          edges {
            node {
              ... on ProposalVote {
                proposal {
                  id
                  title
                  media {
                    url(format: "reference")
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

type Requirement = { participantValue: string }
type DateRequirement = { participantDateOfBirth: string }
type AddressRequirement = { participantAddress: { formatted: string; json: string } }

export const MediatorVoteModalEdit = ({ token, ...props }: Props) => {
  const query = useLazyLoadQuery<MediatorVoteModal_EDIT_Query>(
    EDIT_QUERY,
    {
      stepId: props.stepId,
      token,
      participantId: props.participantId,
      mediatorId: props.mediatorId,
    },
    { fetchPolicy: 'network-only' },
  )

  if (!query) return null

  const { participant, step } = query

  const requirements = step.requirements.edges.map(({ node }) => node)

  const dateOfBirth = (requirements.find(r => r.__typename === 'DateOfBirthRequirement') as DateRequirement)
    ?.participantDateOfBirth

  const defaultValues = {
    votes: participant.votes.edges.map(({ node }) => ({
      value: node.proposal.id,
      label: node.proposal.title,
      media: node.proposal.media?.url,
    })),
    email: participant.email,
    firstname: (requirements.find(r => r.__typename === 'FirstnameRequirement') as Requirement)?.participantValue,
    lastname: (requirements.find(r => r.__typename === 'LastnameRequirement') as Requirement)?.participantValue,
    phone: (requirements.find(r => r.__typename === 'PhoneRequirement') as Requirement)?.participantValue,
    dateOfBirth: dateOfBirth ? moment(dateOfBirth) : null,
    address: (requirements.find(r => r.__typename === 'PostalAddressRequirement') as AddressRequirement)
      ?.participantAddress?.formatted,
    JSONaddress: (requirements.find(r => r.__typename === 'PostalAddressRequirement') as AddressRequirement)
      ?.participantAddress?.json,
    checkboxes: requirements
      .filter(r => r.__typename === 'CheckboxRequirement')
      .reduce((object, requirement) => {
        object[requirement.id] = requirement.participantMeetsTheRequirement ?? false
        return object
      }, {}),
  }
  return <MediatorVoteModal {...props} defaultValues={defaultValues} />
}
export default MediatorVoteModal
