// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { ProposalPreviewFooter_proposal } from '~relay/ProposalPreviewFooter_proposal.graphql';
import type { ProposalPreviewFooter_step } from '~relay/ProposalPreviewFooter_step.graphql';
import Card from '../../Ui/Card/Card';

type Props = {
  proposal: ProposalPreviewFooter_proposal,
  step: ProposalPreviewFooter_step,
};

export class ProposalPreviewFooter extends React.Component<Props> {
  render() {
    const { proposal, step } = this.props;

    const showComments = proposal.form.commentable;
    const showVotes =
      proposal.allVotesOnStep !== null && step && step.voteType && step.voteType !== 'DISABLED';

    if (!showVotes && !showComments) {
      return null;
    }

    return (
      <Card.Counters>
        {showComments && (
          <div className="card__counters__item card__counters__item--comments">
            <div className="card__counters__value">{proposal.comments.totalCount}</div>
            <div>
              <FormattedMessage
                id="comment.count_no_nb"
                values={{
                  count: proposal.comments.totalCount,
                }}
              />
            </div>
          </div>
        )}
        {showVotes && proposal.allVotesOnStep && (
          <div className="card__counters__item card__counters__item--votes">
            <div className="card__counters__value">{proposal.allVotesOnStep.totalCount}</div>
            <div>
              <FormattedMessage
                id="proposal.vote.count_no_nb"
                values={{
                  count: proposal.allVotesOnStep.totalCount,
                }}
              />
            </div>
          </div>
        )}
      </Card.Counters>
    );
  }
}

export default createFragmentContainer(ProposalPreviewFooter, {
  step: graphql`
    fragment ProposalPreviewFooter_step on ProposalStep {
      voteType
    }
  `,
  proposal: graphql`
    fragment ProposalPreviewFooter_proposal on Proposal
      @argumentDefinitions(
        stepId: { type: "ID!" }
        isProfileView: { type: "Boolean", defaultValue: false }
      ) {
      id
      form {
        commentable
      }
      comments: comments {
        totalCount
      }
      allVotesOnStep: votes(stepId: $stepId, first: 0) @skip(if: $isProfileView) {
        totalCount
      }
    }
  `,
});
