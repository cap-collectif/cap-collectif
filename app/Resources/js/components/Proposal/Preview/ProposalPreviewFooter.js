// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import type { ProposalPreviewFooter_proposal } from './__generated__/ProposalPreviewFooter_proposal.graphql';
import type { ProposalPreviewFooter_step } from './__generated__/ProposalPreviewFooter_step.graphql';

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

    const countersClasses = {};

    if (showVotes && showComments) {
      countersClasses.card__counters_multiple = true;
    }

    return (
      <div className={`card__counters ${classNames(countersClasses)}`}>
        {showComments && (
          <div className="card__counter card__counter-comments">
            <div className="card__counter__value">{proposal.comments.totalCount}</div>
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
          <div className="card__counter card__counter-votes">
            <div className="card__counter__value">{proposal.allVotesOnStep.totalCount}</div>
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
      </div>
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
        stepId: { type: "ID!", nonNull: true }
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
