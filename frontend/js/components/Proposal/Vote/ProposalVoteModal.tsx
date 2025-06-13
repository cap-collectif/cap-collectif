import * as React from 'react'
import { useIntl } from 'react-intl'
import moment from 'moment'
import { graphql, commitLocalUpdate, useFragment } from 'react-relay'
import { ConnectionHandler, GraphQLTaggedNode, fetchQuery_DEPRECATED } from 'relay-runtime'
import {
  Modal,
  Button,
  Heading,
  CapUIModalSize,
  MultiStepModal,
  Flex,
  Tag,
  CapUIIcon,
  toast,
} from '@cap-collectif/ui'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box } from 'reakit'
import { isPristine, submit } from 'redux-form'
import { closeVoteModal, vote } from '~/redux/modules/proposal'
import ProposalsUserVotesTable, { getFormName } from '../../Project/Votes/ProposalsUserVotesTable'
import environment from '~/createRelayEnvironment'
import type { GlobalState } from '~/types'
import type { ProposalVoteModal_proposal$key } from '~relay/ProposalVoteModal_proposal.graphql'
import type { ProposalVoteModal_step$key } from '~relay/ProposalVoteModal_step.graphql'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import usePrevious from '~/utils/hooks/usePrevious'
import ResetCss from '~/utils/ResetCss'
import ProposalVoteRequirementsModal from './ProposalVoteModals/ProposalVoteRequirementsModal'
import ProposalVoteConfirmationModal from './ProposalVoteModals/ProposalVoteConfirmationModal'
import invariant from '~/utils/invariant'
import UpdateProposalVotesMutation from '~/mutations/UpdateProposalVotesMutation'
import { refetchViewer } from '~/components/Requirements/RequirementsFormLegacy'
import type { ProposalVoteModal_viewer$key } from '~relay/ProposalVoteModal_viewer.graphql'
import getInitialValues from '~/components/Proposal/Vote/utils/getInitialValues'
import generateValidationSchema from '~/components/Proposal/Vote/utils/generateValidationSchema'
import { ProposalVoteModalContainer, ProposalVoteMultiModalContainer } from './ProposalVoteModal.style'
import VoteMinAlert from '~/components/Project/Votes/VoteMinAlert'
import formatPhoneNumber from '~/utils/formatPhoneNumber'
import CookieMonster from '@shared/utils/CookieMonster'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import isIos from '~/utils/isIos'
import focusOnClose from './utils/focusOnClose'
import { ProposalModalVoteHelpText } from '~/components/Proposal/Vote/ProposalModalVoteHelpText'

type Props = {
  proposal: ProposalVoteModal_proposal$key
  step: ProposalVoteModal_step$key
  viewer: ProposalVoteModal_viewer$key
}
type RequirementType = {
  readonly __typename: string
  readonly id: string
  readonly viewerMeetsTheRequirement?: boolean
  readonly viewerDateOfBirth?: string | null | undefined
  readonly viewerAddress?:
    | {
        readonly formatted: string | null | undefined
        readonly json: string
      }
    | null
    | undefined
  readonly viewerValue?: string | null | undefined
  readonly label?: string
}
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteModal_proposal on Proposal {
    id
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteModal_step on ProposalStep
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    id
    votesRanking
    votesHelpText
    votesMin
    project {
      slug
    }
    ...ProposalVoteRequirementsModal_step
    ...VoteMinAlert_step @arguments(token: $token)
    ... on RequirementStep {
      requirements {
        edges {
          node {
            __typename
            id
            viewerMeetsTheRequirement @include(if: $isAuthenticated)
            ... on DateOfBirthRequirement {
              viewerDateOfBirth @include(if: $isAuthenticated)
            }
            ... on PostalAddressRequirement {
              viewerAddress @include(if: $isAuthenticated) {
                formatted
                json
              }
            }
            ... on FirstnameRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on LastnameRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on PhoneRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on IdentificationCodeRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on FranceConnectRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on CheckboxRequirement {
              label
              viewerMeetsTheRequirement
              id
            }
            ... on PhoneVerifiedRequirement {
              viewerMeetsTheRequirement
            }
          }
        }
      }
    }
    isSecretBallot
    canDisplayBallot
    publishedVoteDate
    ...interpellationLabelHelper_step @relay(mask: false)
    ...ProposalsUserVotesTable_step @arguments(token: $token)
    viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) @include(if: $isAuthenticated) {
      ...ProposalsUserVotesTable_votes
      totalCount
    }
  }
`
const VIEWER_FRAGMENT = graphql`
  fragment ProposalVoteModal_viewer on User {
    phone
    phoneConfirmed
    ...ProposalVoteConfirmationModal_viewer
  }
`
export const ProposalVoteModal = ({ proposal: proposalRef, step: stepRef, viewer: viewerRef }: Props) => {
  const intl = useIntl()
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const localState = useSelector((state: GlobalState) => state)
  const { currentVoteModal } = useSelector((state: GlobalState) => state.proposal)
  const showModal = !!currentVoteModal && currentVoteModal === proposal.id
  const prevShowModal = usePrevious(showModal)
  const { user } = useSelector((state: GlobalState) => state.user)
  const viewerIsConfirmedByEmail = user && user.isEmailConfirmed
  const isAuthenticated = !!user
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const pristine = isPristine(getFormName(step))(localState)
  const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone()
  const isVoteMin = useFeatureFlag('votes_min')
  // Create temp vote to display Proposal in ProposalsUserVotesTable
  const createTmpVote = React.useCallback(() => {
    commitLocalUpdate(environment as any, store => {
      const dataID = `client:newTmpVote:${proposal.id}`
      let newNode: any = store.get(dataID)

      if (!newNode) {
        newNode = store.create(dataID, 'ProposalVote')
      }

      newNode.setValue(viewerIsConfirmedByEmail, 'published')

      if (!viewerIsConfirmedByEmail) {
        newNode.setValue('WAITING_AUTHOR_CONFIRMATION', 'notPublishedReason')
      }

      newNode.setValue(false, 'anonymous')
      newNode.setValue(null, 'id') // This will be used to know that this is the tmp vote

      newNode.setLinkedRecord(store.get(proposal.id), 'proposal')
      // Create a new edge
      const edgeID = `client:newTmpEdge:${proposal.id}`
      let newEdge = store.get(edgeID)

      if (!newEdge) {
        newEdge = store.create(edgeID, 'ProposalVoteEdge')
      }

      newEdge.setLinkedRecord(newNode, 'node')
      const stepProxy = store.get(step.id)
      if (!stepProxy) return
      const args = token
        ? {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
            token,
          }
        : {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
          }
      const connection = stepProxy.getLinkedRecord('viewerVotes', args)

      if (!connection) {
        return
      }

      ConnectionHandler.insertEdgeAfter(connection, newEdge)
    })
  }, [proposal.id, step.id, viewerIsConfirmedByEmail, token])
  const deleteTmpVote = React.useCallback(() => {
    commitLocalUpdate(environment as any, store => {
      const dataID = `client:newTmpVote:${proposal.id}`
      const stepProxy = store.get(step.id)
      if (!stepProxy) return
      const args = token
        ? {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
            token,
          }
        : {
            orderBy: {
              field: 'POSITION',
              direction: 'ASC',
            },
          }
      const connection = stepProxy.getLinkedRecord('viewerVotes', args)

      if (connection) {
        ConnectionHandler.deleteNode(connection, dataID)
      }

      store.delete(dataID)
    })
  }, [proposal.id, step.id, token])
  React.useEffect(() => {
    if (!prevShowModal && showModal) {
      createTmpVote()
    } else if (!showModal && prevShowModal) {
      deleteTmpVote()
    }
  }, [prevShowModal, showModal, deleteTmpVote, createTmpVote])

  const votesMin: number = isVoteMin && step.votesMin ? step.votesMin : 1
  const viewerVotesBeforeValidation = step?.viewerVotes?.totalCount || 0
  const remainingVotesAfterValidation = votesMin - viewerVotesBeforeValidation - 1

  const onSubmit = (values: {
    votes: Array<{
      public: boolean
      id: string
    }>
  }) => {
    const tmpVote = values.votes?.filter(v => v.id === null)[0]
    if (!tmpVote) return
    // First we add the vote
    return vote(dispatch, step.id, proposal.id, !tmpVote.public, intl, true).then(data => {
      if (!data?.addProposalVote?.voteEdge?.node || typeof data.addProposalVote.voteEdge === 'undefined') {
        invariant(false, 'The vote id is missing.')
      }

      tmpVote.id = data.addProposalVote.voteEdge.node.id
      const hasFinished = remainingVotesAfterValidation < 0
      const hasJustFinished = remainingVotesAfterValidation === 0
      const isInterpellation = isInterpellationContextFromStep(step)

      if (!isInterpellation && votesMin > 1 && (!hasFinished || hasJustFinished)) {
        toast({
          variant: hasJustFinished ? 'success' : 'warning',
          content: intl.formatMessage(
            {
              id: hasJustFinished ? 'participation-validated' : 'vote-for-x-proposals',
            },
            {
              num: remainingVotesAfterValidation,
              div: (...chunks) => <div>{chunks}</div>,
              b: (...chunks) => <b>{chunks}</b>,
              a: (...chunks) => (
                <span
                  style={{
                    marginLeft: 4,
                  }}
                >
                  <a href={`/projects/${step.project?.slug || ''}/votes`}>{chunks}</a>
                </span>
              ),
            },
          ),
        })
      } else if (!isInterpellation)
        toast({
          variant: 'success',
          content: intl.formatMessage({
            id: 'vote.add_success',
          }),
        })

      // If the user didn't reorder
      // or update any vote privacy
      // we are clean
      if (!step.votesRanking && pristine) {
        return true
      }

      // Otherwise we update/reorder votes
      return UpdateProposalVotesMutation.commit(
        {
          input: {
            step: step.id,
            votes: values.votes
              .filter(voteFilter => voteFilter.id !== null)
              .map(v => ({
                id: v.id,
                anonymous: !v.public,
              })),
          },
          stepId: step.id,
          isAuthenticated,
          token: null,
        },
        {
          id: null,
          position: -1,
          isVoteRanking: step.votesRanking,
        },
      )
    })
  }

  const onHide = () => {
    dispatch(closeVoteModal())
    focusOnClose(proposal?.id)
  }

  const keyTradForModalVoteTitle = 'proposal.validate.vote'
  let votesHelpText =
    step.isSecretBallot && !step.publishedVoteDate && !step.canDisplayBallot
      ? intl.formatMessage({
          id: 'publish-ballot-no-date-help-text',
        })
      : ''
  votesHelpText =
    step.isSecretBallot && step.publishedVoteDate && !step.canDisplayBallot
      ? intl.formatMessage(
          {
            id: 'publish-ballot-date-help-text',
          },
          {
            date: moment(step.publishedVoteDate).format('DD/MM/YYYY'),
            time: moment(step.publishedVoteDate).format('HH:mm'),
          },
        )
      : votesHelpText

  if (step.votesHelpText) {
    votesHelpText = votesHelpText ? `${votesHelpText} ${step.votesHelpText}` : `${step.votesHelpText}`
  }

  const requirements: RequirementType[] =
    step.requirements?.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean) || []
  // Check if only Phone Number verification is required to vote
  const isPhoneVerificationOnly =
    requirements.filter(
      requirement =>
        requirement.__typename !== 'PhoneVerifiedRequirement' && requirement.__typename !== 'PhoneRequirement',
    ).length === 0
  const hasPhoneRequirements =
    requirements.filter(
      requrement =>
        requrement.__typename === 'PhoneVerifiedRequirement' || requrement.__typename === 'PhoneRequirement',
    ).length === 2
  const initialValues = getInitialValues(requirements, isPhoneVerificationOnly, hasPhoneRequirements, viewer)
  const requirementsFormSchema = generateValidationSchema(initialValues, isAuthenticated, intl)
  const requirementsForm = useForm<any>({
    mode: 'onChange',
    defaultValues: initialValues,
    resolver: yupResolver(requirementsFormSchema),
  })
  const validationForm = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      code: '',
    },
  })

  /* # CHECK PHONE REQUIREMENT # */
  const phoneFieldValue = requirementsForm.watch('PhoneVerifiedRequirement.phoneNumber')
  const hasFieldPhoneUnchanged = user?.phone ? formatPhoneNumber(user.phone) === phoneFieldValue : false
  const hasViewerPhoneRequirementVerified =
    requirements.find(requirement => requirement.__typename === 'PhoneVerifiedRequirement')
      ?.viewerMeetsTheRequirement || false
  const needToVerifyPhone = hasPhoneRequirements && (!hasFieldPhoneUnchanged || !hasViewerPhoneRequirementVerified)
  const allRequirementsMet = requirements?.every(requirement => requirement.viewerMeetsTheRequirement)

  if (!showModal) {
    return null
  }

  const totalStepNumber = needToVerifyPhone ? 3 : 2

  return !allRequirementsMet ? (
    step.requirements ? (
      <ProposalVoteMultiModalContainer
        baseId="proposal-vote-modal"
        id="proposal-vote-modal"
        onClose={onHide}
        size={CapUIModalSize.Md}
        fullSizeOnMobile
        forceModalDialogToFalse={isIos()}
        show={showModal}
        hideOnClickOutside={false}
      >
        <ProposalVoteRequirementsModal
          modalTitle={keyTradForModalVoteTitle}
          isPhoneVerificationOnly={isPhoneVerificationOnly}
          initialValues={initialValues}
          hasPhoneRequirements={hasPhoneRequirements}
          requirementsForm={requirementsForm}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          needToVerifyPhone={needToVerifyPhone}
          step={step}
          totalStepNumber={totalStepNumber}
        />
        {needToVerifyPhone && (
          <ProposalVoteConfirmationModal
            viewer={viewer}
            setIsLoading={setIsLoading}
            validationForm={validationForm}
            isLoading={isLoading}
            needToVerifyPhone={needToVerifyPhone}
            modalTitle={keyTradForModalVoteTitle}
            totalStepNumber={totalStepNumber}
          />
        )}
        <>
          <ResetCss>
            <MultiStepModal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
              <Heading>
                {intl.formatMessage({
                  id: keyTradForModalVoteTitle,
                })}
              </Heading>
            </MultiStepModal.Header>
          </ResetCss>
          <MultiStepModal.Body>
            <p className="sr-only">
              {intl.formatMessage(
                { id: 'verification-nth-step-over' },
                { current: totalStepNumber, total: totalStepNumber },
              )}
            </p>
            <Box id="proposal-validate-vote-modal">
              <Flex direction="column" align="flex-start" spacing={6}>
                <VoteMinAlert step={step} translationKey={keyTradForModalVoteTitle} /> {/** @ts-ignore */}
                {/** @ts-ignore */}
                <ProposalsUserVotesTable onSubmit={onSubmit} step={step} votes={step.viewerVotes} />
                <ProposalModalVoteHelpText votesHelpText={votesHelpText} step={step} />
              </Flex>
            </Box>
          </MultiStepModal.Body>
          <MultiStepModal.Footer>
            <Button
              id="confirm-proposal-vote"
              variant="primary"
              variantColor="primary"
              variantSize="big"
              aria-label={intl.formatMessage({
                id: 'proposal.validate.vote',
              })}
              onClick={() => {
                dispatch(submit(getFormName(step)))
                fetchQuery_DEPRECATED(environment, refetchViewer as GraphQLTaggedNode, {
                  stepId: step.id,
                  isAuthenticated,
                })
              }}
            >
              {intl.formatMessage({
                id: 'proposal.validate.vote',
              })}
            </Button>
          </MultiStepModal.Footer>
        </>
      </ProposalVoteMultiModalContainer>
    ) : null
  ) : (
    <ProposalVoteModalContainer
      baseId="proposal-vote-modal"
      id="proposal-vote-modal"
      onClose={onHide}
      ariaLabel="contained-modal-title-lg"
      size={CapUIModalSize.Md}
      fullSizeOnMobile
      show={showModal}
      hideOnClickOutside={false}
    >
      <>
        <ResetCss>
          <Modal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
            <Heading>
              {intl.formatMessage({
                id: 'proposal.validate.votes',
              })}
            </Heading>
          </Modal.Header>
        </ResetCss>

        <Modal.Body>
          <Flex direction="column" align="flex-start" spacing={6}>
            {requirements?.length ? (
              <Tag variantColor="success">
                <Tag.LeftIcon name={CapUIIcon.Check} />
                <Tag.Label>
                  {intl.formatMessage({
                    id: 'vote.conditions.met',
                  })}
                </Tag.Label>
              </Tag>
            ) : null}
            <VoteMinAlert step={step} translationKey={keyTradForModalVoteTitle} /> {/** @ts-ignore */}
            <ProposalsUserVotesTable onSubmit={onSubmit} step={step} votes={step.viewerVotes} />
            <ProposalModalVoteHelpText votesHelpText={votesHelpText} step={step} />
          </Flex>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            id="confirm-proposal-vote"
            onClick={() => {
              dispatch(submit(getFormName(step)))
              // we need to add a timeout because it causes a bug if the query ends before the mutation triggered by `dispatch(submit(getFormName(step)))`
              setTimeout(() => {
                fetchQuery_DEPRECATED(environment, refetchViewer as GraphQLTaggedNode, {
                  stepId: step.id,
                  isAuthenticated,
                })
              }, 500)
            }}
          >
            {intl.formatMessage({
              id: !remainingVotesAfterValidation ? 'validate-participation' : 'keep-voting',
            })}
          </Button>
        </Modal.Footer>
      </>
    </ProposalVoteModalContainer>
  )
}
export default ProposalVoteModal
