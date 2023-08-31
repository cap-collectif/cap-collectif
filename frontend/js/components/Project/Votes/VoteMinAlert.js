// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import type { VoteMinAlert_step } from '~relay/VoteMinAlert_step.graphql';
import { VoteMinAlertContainer } from './ProposalsUserVotes.style';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {|
  step: VoteMinAlert_step,
  translationKey: string,
|};

export const VoteMinAlert = ({ step, translationKey }: Props) => {
  const isInterpellation = isInterpellationContextFromStep(step);
  const isVoteMin = useFeatureFlag('votes_min');
  const votesMin: number = isVoteMin && step.votesMin ? step.votesMin : 1;

  const { votesRanking, votesLimit } = step;

  const viewerVotesBeforeValidation = step?.viewerVotes?.totalCount;
  const remainingVotesAfterValidation = votesMin - viewerVotesBeforeValidation - 1;
  const hasFinished = remainingVotesAfterValidation < 0;

  if (isInterpellation) return null;

  return (
    <VoteMinAlertContainer>
      {!votesMin ||
      votesMin === 1 ||
      hasFinished ||
      (votesMin && !remainingVotesAfterValidation && !votesRanking) ? (
        <h4>
          <FormattedMessage
            id={translationKey}
            values={{
              num: step.viewerVotes ? viewerVotesBeforeValidation : 0,
            }}
          />
        </h4>
      ) : (
        <>
          <Icon name={ICON_NAME.warningRounded} size={25} />
          <div>
            <div>
              <span>
                <FormattedMessage
                  id={
                    votesRanking && !remainingVotesAfterValidation
                      ? 'rank-your-proposals'
                      : 'vote-for-x-proposals'
                  }
                  values={{ num: remainingVotesAfterValidation }}
                />
              </span>
            </div>
            <div className="mb-20">
              {votesRanking &&
              !remainingVotesAfterValidation &&
              votesLimit &&
              votesLimit !== votesMin ? (
                <span>
                  <FormattedMessage
                    id="you-can-keep-voting-for-x-proposals"
                    values={{ num: votesLimit }}
                  />
                </span>
              ) : null}
            </div>
          </div>
        </>
      )}
    </VoteMinAlertContainer>
  );
};

export default createFragmentContainer(VoteMinAlert, {
  step: graphql`
    fragment VoteMinAlert_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        totalCount
      }
      votesMin
      votesLimit
      votesRanking
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
