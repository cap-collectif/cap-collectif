import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { submit, isDirty, isSubmitting } from 'redux-form'
import { connect } from 'react-redux'
import moment from 'moment'
import { graphql, createFragmentContainer } from 'react-relay'
import ProposalsUserVotesTable from './ProposalsUserVotesTable'
import SubmitButton from '../../Form/SubmitButton'
import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation'
import type { ProposalsUserVotesStep_step$data } from '~relay/ProposalsUserVotesStep_step.graphql'
import WYSIWYGRender from '../../Form/WYSIWYGRender'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import VoteMinAlert from './VoteMinAlert'
import { ProposalUserVoteStepContainer, BackToVote } from './ProposalsUserVotes.style'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import withColors from '~/components/Utils/withColors'
import type { GlobalState } from '~/types'

type RelayProps = {
  step: ProposalsUserVotesStep_step$data
}
type Props = RelayProps & {
  dispatch: (...args: Array<any>) => any
  dirty: boolean
  submitting: boolean
  isAuthenticated: boolean
  linkColor: string
}
export const ProposalsUserVotesStep = ({ step, dirty, submitting, dispatch, isAuthenticated, linkColor }: Props) => {
  const [showAbout, setShowAbout] = useState<boolean>(false)
  const intl = useIntl()
  const keyTradProjectCount =
    step.form?.objectType === 'PROPOSAL'
      ? isInterpellationContextFromStep(step)
        ? 'interpellation.support.count'
        : 'votes-count'
      : 'count-questions'

  const onSubmit = (values: {
    votes: Array<{
      public: boolean
      id: string
    }>
  }) => {
    return UpdateProposalVotesMutation.commit(
      {
        input: {
          step: step.id,
          votes: values.votes.map(v => ({
            id: v.id,
            anonymous: !v.public,
          })),
        },
        stepId: step.id,
        isAuthenticated,
        token: null,
      },
      null,
    )
  }

  if (!step.viewerVotes) {
    return null
  }

  const getVoteHelpWording = (): string => {
    let votesHelpText = ''

    if (step.isSecretBallot && !step.publishedVoteDate) {
      votesHelpText = `${votesHelpText} ${intl.formatMessage({
        id: 'publish-ballot-no-date-help-text',
      })}`
    }

    if (step.isSecretBallot && step.publishedVoteDate) {
      votesHelpText = `${votesHelpText} ${intl.formatMessage(
        {
          id: 'publish-ballot-date-help-text',
        },
        {
          date: moment(step.publishedVoteDate).format('DD/MM/YYYY'),
          time: moment(step.publishedVoteDate).format('HH:mm'),
        },
      )}`
    }

    if (step.votesHelpText) {
      votesHelpText = `${votesHelpText} ${step.votesHelpText}`
    }

    return votesHelpText
  }

  const votesHelpText = getVoteHelpWording()
  return (
    <ProposalUserVoteStepContainer id={`vote-table-step-${step.slug || ''}`}>
      <h2>{step.title}</h2>
      <div>
        <BackToVote href={step.url}>
          <Icon name={ICON_NAME.chevronLeft} size={15} color="currentColor" />
          <span>
            {' '}
            <FormattedMessage
              id={isInterpellationContextFromStep(step) ? 'project.supports.back' : 'project.votes.back'}
            />
          </span>
        </BackToVote>
        {votesHelpText && (
          <button
            style={{
              color: linkColor,
            }}
            type="button"
            onClick={() => setShowAbout(!showAbout)}
          >
            <FormattedMessage
              id={
                isInterpellationContextFromStep(step)
                  ? 'admin.fields.step.supportsHelpText'
                  : 'admin.fields.step.votesHelpText'
              }
            />
          </button>
        )}
      </div>
      {showAbout && (
        <div className="mt-20 mb-20">
          <WYSIWYGRender value={votesHelpText} />
        </div>
      )}

      {step.viewerVotes && step.viewerVotes.totalCount > 0 && (
        <div>
          <VoteMinAlert step={step} translationKey={keyTradProjectCount} isVotesPage />
          <ProposalsUserVotesTable onSubmit={onSubmit} deletable step={step} votes={step.viewerVotes} />
          <SubmitButton
            id="confirm-update-votes"
            disabled={!dirty}
            onSubmit={() => {
              dispatch(submit(`proposal-user-vote-form-step-${step.id}`))
            }}
            label="global.save_modifications"
            isSubmitting={submitting}
            bsStyle="success"
            className="mt-10"
          />
        </div>
      )}
    </ProposalUserVoteStepContainer>
  )
}

const mapStateToProps = (state: GlobalState, props: RelayProps) => ({
  dirty: isDirty(`proposal-user-vote-form-step-${props.step.id}`)(state),
  submitting: isSubmitting(`proposal-user-vote-form-step-${props.step.id}`)(state),
  isAuthenticated: !!state.user.user,
})

// @ts-ignore
const container = connect(mapStateToProps)(withColors(ProposalsUserVotesStep))
export default createFragmentContainer(container, {
  step: graphql`
    fragment ProposalsUserVotesStep_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
      ...ProposalsUserVotesTable_step @arguments(token: $token)
      ...VoteMinAlert_step @arguments(token: $token)
      id
      title
      votesHelpText
      slug
      url
      isSecretBallot
      publishedVoteDate
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        totalCount
        ...ProposalsUserVotesTable_votes
      }
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
})
