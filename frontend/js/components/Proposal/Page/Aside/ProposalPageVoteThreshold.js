// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { ProgressBar } from 'react-bootstrap';
import type { ProposalPageVoteThreshold_step } from '~relay/ProposalPageVoteThreshold_step.graphql';
import type { ProposalPageVoteThreshold_proposal } from '~relay/ProposalPageVoteThreshold_proposal.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';
import { Card, CategoryCircledIcon } from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';

type Props = {
  proposal: ProposalPageVoteThreshold_proposal,
  step: ProposalPageVoteThreshold_step,
};

const ProposalPageVoteThresholdContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px 30px;

  > h4 {
    margin: 0;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    color: ${colors.darkText};
  }

  > p {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
      color: ${colors.secondaryGray};
    }
  }

  /** We use the bootstrap progress-bar, just overriding some style */
  .progress,
  .progress-bar {
    border-radius: 15px !important;
  }
`;

export class ProposalPageVoteThreshold extends React.Component<Props> {
  render() {
    const { step, proposal } = this.props;
    // We should use a new query render to fetch votes only from the step
    const votesCount = proposal.votes.totalCount;
    const { voteThreshold } = step;
    if (voteThreshold === null || typeof voteThreshold === 'undefined') {
      return null;
    }
    const votesRemaining = voteThreshold - votesCount;
    const votesPercentage = Math.ceil((votesCount * 100) / voteThreshold);
    const isInterpellation = isInterpellationContextFromProposal(proposal);
    return (
      <Card id="ProposalPageVoteThreshold">
        <ProposalPageVoteThresholdContainer>
          <h4>
            {votesPercentage >= 100 ? (
              <FormattedMessage
                id={
                  isInterpellation
                    ? 'interpellation.vote.threshold.reached'
                    : 'proposal.vote.threshold.reached'
                }
              />
            ) : (
              <FormattedMessage
                id={
                  isInterpellation
                    ? 'interpellation.support.threshold.title'
                    : 'proposal.vote.threshold.title'
                }
              />
            )}
          </h4>
          <p>
            <CategoryCircledIcon size={24} paddingTop={0} paddingLeft={6}>
              <Icon name={ICON_NAME.like} size={14} color={colors.secondaryGray} />
            </CategoryCircledIcon>
            <FormattedMessage
              id={isInterpellation ? 'interpellation.support.count' : 'proposal.vote.count'}
              values={{
                num: votesCount,
              }}
            />
          </p>
          <ProgressBar
            now={votesPercentage}
            label={`${votesPercentage}%`}
            min={0}
            max={votesPercentage > 100 ? votesPercentage : 100}
            bsStyle="success"
          />
          <div>
            {votesPercentage >= 100 && (
              <FormattedMessage
                id={
                  isInterpellation
                    ? 'interpellation.support.threshold.progress_reached'
                    : 'proposal.vote.threshold.progress_reached'
                }
                values={{
                  num: votesCount,
                  max: voteThreshold,
                }}
              />
            )}
            {votesPercentage < 100 && (
              <FormattedMessage
                id={
                  isInterpellation
                    ? 'interpellation.support.threshold.progress'
                    : 'proposal.vote.threshold.progress'
                }
                values={{
                  num: votesRemaining,
                  max: voteThreshold,
                }}
              />
            )}
          </div>
        </ProposalPageVoteThresholdContainer>
      </Card>
    );
  }
}

export default createFragmentContainer(ProposalPageVoteThreshold, {
  proposal: graphql`
    fragment ProposalPageVoteThreshold_proposal on Proposal {
      id
      votes {
        totalCount
      }
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
  step: graphql`
    fragment ProposalPageVoteThreshold_step on Step {
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
