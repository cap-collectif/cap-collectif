// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { ProposalPreviewFooter_proposal } from '~relay/ProposalPreviewFooter_proposal.graphql';
import type { ProposalPreviewFooter_step } from '~relay/ProposalPreviewFooter_step.graphql';
import Card from '../../Ui/Card/Card';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import Text from '~ui/Primitives/Text';
import Tooltip from '~ds/Tooltip/Tooltip';

type Props = {
  proposal: ProposalPreviewFooter_proposal,
  step: ProposalPreviewFooter_step,
};

export const ProposalPreviewFooter = ({ proposal, step }: Props) => {
  const intl = useIntl();
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
  const numericVotesTotalCount = proposal?.allVotesOnStep?.totalCount ?? 0;
  const numericVotesTotalPointsCount = proposal?.allVotesOnStep?.totalPointsCount ?? 0;
  const paperVotesTotalCount = proposal?.paperVotesTotalCount ?? 0;
  const paperVotesTotalPointsCount = proposal?.paperVotesTotalPointsCount ?? 0;
  const votesTotalCount = numericVotesTotalCount + paperVotesTotalCount;
  const votesTotalPointsCount = numericVotesTotalPointsCount + paperVotesTotalPointsCount;

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
      {step.canDisplayBallot && showVotes && (
        <>
          <div className="card__counters__item card__counters__item--votes">
            {votesTotalCount > 0 ? (
              <Tooltip
                backgroundColor="black"
                borderRadius="4px"
                label={
                  <>
                    {numericVotesTotalCount > 0 && (
                      <Text textAlign="center" lineHeight="sm" fontSize={1} fontFamily="OpenSans">
                        {intl.formatMessage(
                          { id: 'numeric-votes-count' },
                          { num: numericVotesTotalCount },
                        )}
                      </Text>
                    )}
                    {paperVotesTotalCount > 0 && (
                      <Text textAlign="center" lineHeight="sm" fontSize={1} fontFamily="OpenSans">
                        {intl.formatMessage(
                          { id: 'paper-votes-count' },
                          { num: paperVotesTotalCount },
                        )}
                      </Text>
                    )}
                  </>
                }>
                <div className="card__counters__value">{votesTotalCount}</div>
              </Tooltip>
            ) : (
              <div className="card__counters__value">{votesTotalCount}</div>
            )}
            <p>{intl.formatMessage({ id: voteCountLabel }, { count: votesTotalCount })}</p>
          </div>
          {step.votesRanking && (
            <div className="card__counters__item card__counters__item--votes">
              {votesTotalPointsCount > 0 ? (
                <Tooltip
                  backgroundColor="black"
                  borderRadius="4px"
                  label={
                    <>
                      {numericVotesTotalPointsCount > 0 && (
                        <Text textAlign="center" lineHeight="sm" fontSize={1} fontFamily="OpenSans">
                          {intl.formatMessage(
                            { id: 'numeric-points-count' },
                            { num: numericVotesTotalPointsCount },
                          )}
                        </Text>
                      )}
                      {paperVotesTotalPointsCount > 0 && (
                        <Text textAlign="center" lineHeight="sm" fontSize={1} fontFamily="OpenSans">
                          {intl.formatMessage(
                            { id: 'paper-points-count' },
                            { num: paperVotesTotalPointsCount },
                          )}
                        </Text>
                      )}
                    </>
                  }>
                  <div className="card__counters__value">{votesTotalPointsCount}</div>
                </Tooltip>
              ) : (
                <div className="card__counters__value">{votesTotalPointsCount}</div>
              )}
              <p>{intl.formatMessage({ id: 'points-count' }, { num: votesTotalPointsCount })}</p>
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
      paperVotesTotalCount
      paperVotesTotalPointsCount
    }
  `,
});
