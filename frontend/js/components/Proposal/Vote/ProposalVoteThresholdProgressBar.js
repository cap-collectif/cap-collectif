// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProposalVoteThresholdProgressBar_proposal } from '~relay/ProposalVoteThresholdProgressBar_proposal.graphql';
import type { ProposalVoteThresholdProgressBar_step } from '~relay/ProposalVoteThresholdProgressBar_step.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';

type Props = {
  proposal: ProposalVoteThresholdProgressBar_proposal,
  step: ProposalVoteThresholdProgressBar_step,
  showPoints: boolean,
};

export class ProposalVoteThresholdProgressBar extends React.Component<Props> {
  render() {
    const { proposal, step, showPoints } = this.props;
    const votesCount = proposal.votes.totalCount + proposal.paperVotesTotalCount;
    const pointsCount = proposal.votes.totalPointsCount + proposal.paperVotesTotalPointsCount;
    const { voteThreshold } = step;
    if (voteThreshold === null || typeof voteThreshold === 'undefined') {
      return null;
    }
    const voteCountLabel = isInterpellationContextFromProposal(proposal)
      ? 'support.count'
      : 'vote.count';

    return (
      <div className="card__threshold" style={{ fontSize: '85%', marginTop: '15px' }}>
        <div className="d-flex justify-content-between mb-10">
          <div>
            <Icon name={ICON_NAME.like} size={14} color={colors.secondaryGray} />
            &nbsp;
            {votesCount >= voteThreshold && (
              <FormattedMessage id="proposal.vote.threshold.reached" />
            )}
            {votesCount < voteThreshold && (
              <FormattedMessage
                id={voteCountLabel}
                values={{
                  count: votesCount,
                }}
              />
            )}
          </div>
          {proposal && proposal.votes && showPoints && (
            <div>
              <Icon name={ICON_NAME.trophy} size={14} color={colors.secondaryGray} />
              &nbsp;
              <FormattedMessage id="count-points" values={{ num: pointsCount }} />
            </div>
          )}
        </div>
        <ProgressBar
          min={0}
          max={votesCount >= voteThreshold ? votesCount : voteThreshold}
          now={votesCount}
          className="mb-0"
          bsStyle="success"
          label={
            votesCount >= voteThreshold ? (
              <FormattedMessage id="proposal.vote.threshold.reached" />
            ) : (
              ''
            )
          }
        />
      </div>
    );
  }
}

export default createFragmentContainer(ProposalVoteThresholdProgressBar, {
  proposal: graphql`
    fragment ProposalVoteThresholdProgressBar_proposal on Proposal {
      id
      votes(stepId: $stepId, first: 0) {
        totalCount
        totalPointsCount
      }
      paperVotesTotalCount(stepId: $stepId)
      paperVotesTotalPointsCount(stepId: $stepId)
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
  step: graphql`
    fragment ProposalVoteThresholdProgressBar_step on Step {
      id
      ... on CollectStep {
        voteThreshold
      }
      ... on SelectionStep {
        voteThreshold
      }
    }
  `,
});
