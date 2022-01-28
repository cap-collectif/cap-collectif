// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import type { ProposalPreviewFooter_proposal } from '~relay/ProposalPreviewFooter_proposal.graphql';
import type { ProposalPreviewFooter_step } from '~relay/ProposalPreviewFooter_step.graphql';
import Card from '../../Ui/Card/Card';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {
  proposal: ProposalPreviewFooter_proposal,
  step: ProposalPreviewFooter_step,
};

export const ProposalPreviewFooter = ({ proposal, step }: Props) => {
  const showDonationInfos =
    useFeatureFlag('unstable__tipsmeee') &&
    proposal.form.usingTipsmeee &&
    proposal.tipsMeeeDonation;

  const showComments = proposal.form.commentable;
  const showVotes =
    proposal.allVotesOnStep !== null && step && step.voteType && step.voteType !== 'DISABLED';
  const projectType = step.project && step.project.type ? step.project.type.title : null;
  const voteCountLabel =
    projectType === 'project.types.interpellation' && proposal.form.objectType === 'PROPOSAL'
      ? 'support.count_no_nb'
      : 'vote.count_no_nb';

  if (showDonationInfos) {
    return (
      <Card.Counters>
        <div className="card__counters__item card__counters__item--comments">
          <div className="card__counters__value">
            {proposal.tipsMeeeDonation?.donationTotalCount ?? 0} €
          </div>
          <FormattedMessage
            id="donation_amount_collected.count_no_nb"
            values={{
              count: proposal.tipsMeeeDonation?.donationTotalCount ?? 0,
            }}
            tagName="div"
          />
        </div>
        <div className="card__counters__item card__counters__item--comments">
          <div className="card__counters__value">
            {proposal.tipsMeeeDonation?.donationCount ?? 0}
          </div>
          <FormattedMessage
            id="donation.count_no_nb"
            values={{
              count: proposal.tipsMeeeDonation?.donationCount ?? 0,
            }}
            tagName="div"
          />
        </div>
      </Card.Counters>
    );
  }

  if (!showVotes && !showComments) {
    return null;
  }

  return (
    <Card.Counters>
      {showDonationInfos && (
        <>
          <div className="card__counters__item card__counters__item--comments">
            <div className="card__counters__value">
              {proposal.tipsMeeeDonation?.donationTotalCount}
            </div>
            <FormattedMessage
              id="comment.count_no_nb"
              values={{
                count: proposal.tipsMeeeDonation?.donationTotalCount,
              }}
              tagName="div"
            />
          </div>
          <div className="card__counters__item card__counters__item--comments">
            <div className="card__counters__value">{proposal.tipsMeeeDonation?.donationCount}</div>
            <FormattedMessage
              id="comment.count_no_nb"
              values={{
                count: proposal.tipsMeeeDonation?.donationCount,
              }}
              tagName="div"
            />
          </div>
        </>
      )}
      {showComments && (
        <div className="card__counters__item card__counters__item--comments">
          <div className="card__counters__value">{proposal.allComments.totalCountWithAnswers}</div>
          <FormattedMessage
            id="comment.count_no_nb"
            values={{
              count: proposal.allComments.totalCountWithAnswers,
            }}
            tagName="div"
          />
        </div>
      )}
      {step.canDisplayBallot &&
        showVotes &&
        proposal.allVotesOnStep && (
          <>
            <div className="card__counters__item card__counters__item--votes">
              <div className="card__counters__value">{proposal.allVotesOnStep.totalCount}</div>
              <FormattedMessage
                id={voteCountLabel}
                values={{
                  count: proposal.allVotesOnStep.totalCount,
                }}
                tagName="div"
              />
            </div>
            {step.votesRanking && proposal.allVotesOnStep && (
              <div className="card__counters__item card__counters__item--votes">
                <div className="card__counters__value">
                  {proposal.allVotesOnStep.totalPointsCount}
                </div>
                <FormattedMessage
                  id="points-count"
                  values={{
                    num: proposal.allVotesOnStep.totalPointsCount,
                  }}
                  tagName="div"
                />
              </div>
            )}
          </>
        )}
    </Card.Counters>
  );
};

export default createFragmentContainer(connect<any, any, _, _, _, _>()(ProposalPreviewFooter), {
  step: graphql`
    fragment ProposalPreviewFooter_step on ProposalStep {
      voteType
      project {
        type {
          title
        }
      }
      votesRanking
      canDisplayBallot
    }
  `,
  proposal: graphql`
    fragment ProposalPreviewFooter_proposal on Proposal
    @argumentDefinitions(
      stepId: { type: "ID!" }
      isProfileView: { type: "Boolean", defaultValue: false }
      isTipsMeeeEnabled: { type: "Boolean!" }
    ) {
      id
      form {
        commentable
        objectType
        usingTipsmeee
      }
      tipsMeeeDonation: tipsmeee @include(if: $isTipsMeeeEnabled) {
        donationTotalCount
        donationCount
      }
      allComments: comments(first: 0) {
        totalCountWithAnswers
      }
      allVotesOnStep: votes(stepId: $stepId, first: 0) @skip(if: $isProfileView) {
        totalCount
        totalPointsCount
      }
    }
  `,
});
