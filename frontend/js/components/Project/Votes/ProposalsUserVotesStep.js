// @flow
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { submit, isDirty, isSubmitting } from 'redux-form';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalsUserVotesTable from './ProposalsUserVotesTable';
import SubmitButton from '../../Form/SubmitButton';
import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation';
import type { ProposalsUserVotesStep_step } from '~relay/ProposalsUserVotesStep_step.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import VoteMinAlert from './VoteMinAlert';
import { ProposalUserVoteStepContainer, BackToVote } from './ProposalsUserVotes.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import withColors from '~/components/Utils/withColors';
import type { GlobalState } from '~/types';

type RelayProps = {|
  step: ProposalsUserVotesStep_step,
|};
type Props = {|
  ...RelayProps,
  dispatch: Function,
  dirty: boolean,
  submitting: boolean,
  isAuthenticated: boolean,
  linkColor: string,
|};

export const ProposalsUserVotesStep = ({
  step,
  dirty,
  submitting,
  dispatch,
  isAuthenticated,
  linkColor,
}: Props) => {
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const keyTradProjectCount =
    step.form?.objectType === 'PROPOSAL'
      ? isInterpellationContextFromStep(step)
        ? 'interpellation.support.count'
        : 'votes-count'
      : 'count-questions';

  const onSubmit = (values: { votes: Array<{ public: boolean, id: string }> }) => {
    return UpdateProposalVotesMutation.commit(
      {
        input: {
          step: step.id,
          votes: values.votes.map(v => ({ id: v.id, anonymous: !v.public })),
        },
        stepId: step.id,
        isAuthenticated,
      },
      null,
    );
  };

  if (!step.viewerVotes) {
    return null;
  }

  return (
    <ProposalUserVoteStepContainer id={`vote-table-step-${step.slug || ''}`}>
      <h2>{step.title}</h2>
      <div>
        <BackToVote href={step.url}>
          <Icon name={ICON_NAME.chevronLeft} size={15} color="currentColor" />
          <span>
            {' '}
            <FormattedMessage
              id={
                isInterpellationContextFromStep(step)
                  ? 'project.supports.back'
                  : 'project.votes.back'
              }
            />
          </span>
        </BackToVote>
        {step.votesHelpText && (
          <button
            style={{ color: linkColor }}
            type="button"
            onClick={() => setShowAbout(!showAbout)}>
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
          <WYSIWYGRender value={step.votesHelpText} />
        </div>
      )}

      {step.viewerVotes && step.viewerVotes.totalCount > 0 && (
        <div>
          <VoteMinAlert step={step} translationKey={keyTradProjectCount} />
          <ProposalsUserVotesTable
            onSubmit={onSubmit}
            deletable
            step={step}
            votes={step.viewerVotes}
          />
          <SubmitButton
            id="confirm-update-votes"
            disabled={!dirty}
            onSubmit={() => {
              dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
            }}
            label="global.save_modifications"
            isSubmitting={submitting}
            bsStyle="success"
            className="mt-10"
          />
        </div>
      )}
    </ProposalUserVoteStepContainer>
  );
};

const mapStateToProps = (state: GlobalState, props: RelayProps) => ({
  dirty: isDirty(`proposal-user-vote-form-step-${props.step.id}`)(state),
  submitting: isSubmitting(`proposal-user-vote-form-step-${props.step.id}`)(state),
  isAuthenticated: !!state.user.user,
});
const container = connect(mapStateToProps)(withColors(ProposalsUserVotesStep));

export default createFragmentContainer(container, {
  step: graphql`
    fragment ProposalsUserVotesStep_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...ProposalsUserVotesTable_step
      ...VoteMinAlert_step
      id
      title
      votesHelpText
      slug
      url
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        totalCount
        ...ProposalsUserVotesTable_votes
      }
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
