// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import type { VoteMinAlert_step } from '~relay/VoteMinAlert_step.graphql';
import { VoteMinAlertContainer } from './ProposalsUserVotes.style';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import type { FeatureToggles, State } from '~/types';

type Props = {|
  step: VoteMinAlert_step,
  translationKey: string,
  features: FeatureToggles,
|};

export const VoteMinAlert = ({ step, translationKey, features }: Props) => {
  const isInterpellation = isInterpellationContextFromStep(step);
  const votesMin: number = features.votes_min && step.votesMin ? step.votesMin : 1;
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

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(VoteMinAlert), {
  step: graphql`
    fragment VoteMinAlert_step on ProposalStep {
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        totalCount
      }
      votesMin
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
