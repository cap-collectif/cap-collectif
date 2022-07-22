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
  return (
    <VoteMinAlertContainer>
      {!votesMin ||
      !step?.viewerVotes?.totalCount ||
      (votesMin && step?.viewerVotes?.totalCount >= votesMin) ? (
        <h4>
          <FormattedMessage
            id={translationKey}
            values={{
              num: step.viewerVotes ? step.viewerVotes.totalCount : 0,
            }}
          />
        </h4>
      ) : (
        <>
          <Icon name={ICON_NAME.warningRounded} size={25} />
          <div>
            <div>
              <span>
                {`${step.viewerVotes.totalCount}/`}
                <FormattedMessage
                  id={isInterpellation ? 'mandatory-support' : 'mandatory-vote'}
                  values={{ num: votesMin }}
                />
              </span>
            </div>
            <div className="mb-20">
              <span>
                <FormattedMessage
                  id={
                    isInterpellation
                      ? 'support-to-validate-your-participation'
                      : 'vote-to-validate-your-participation'
                  }
                  values={{ num: votesMin - step?.viewerVotes.totalCount }}
                />
              </span>
            </div>
          </div>
        </>
      )}
    </VoteMinAlertContainer>
  );
};

export default createFragmentContainer(VoteMinAlert, {
  step: graphql`
    fragment VoteMinAlert_step on ProposalStep
    @argumentDefinitions(token: { type: "String" })
    {
      viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
        totalCount
      }
      votesMin
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
