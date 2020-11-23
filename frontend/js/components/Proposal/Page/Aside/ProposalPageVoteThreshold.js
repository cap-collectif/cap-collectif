// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { ProgressBar } from 'react-bootstrap';
import type { ProposalPageVoteThreshold_step } from '~relay/ProposalPageVoteThreshold_step.graphql';
import type { ProposalPageVoteThreshold_proposal } from '~relay/ProposalPageVoteThreshold_proposal.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';
import { Card, CategoryCircledIcon } from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import { MetadataRow } from '~/components/Proposal/Page/Aside/ProposalPageMetadata';

type Props = {
  proposal: ProposalPageVoteThreshold_proposal,
  step: ProposalPageVoteThreshold_step,
  showPoints: boolean,
  intl: IntlShape,
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
    justify-content: space-between;
    .vote-counter {
      display: flex;
      align-items: center;
    }
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
    const { step, proposal, showPoints, intl } = this.props;
    // We should use a new query render to fetch votes only from the step
    const votesCount = proposal.votes.totalCount;
    const { voteThreshold } = step;
    let votesRemaining = 0;
    let votesPercentage = 0;
    if (voteThreshold !== null && typeof voteThreshold !== 'undefined' && voteThreshold > 0) {
      votesRemaining = voteThreshold - votesCount;
      votesPercentage = Math.ceil((votesCount * 100) / voteThreshold);
    }
    const isInterpellation = isInterpellationContextFromProposal(proposal);
    return (
      <Card id="ProposalPageVoteThreshold">
        <ProposalPageVoteThresholdContainer>
          <h4>
            {voteThreshold && votesPercentage >= 100 ? (
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
            <div className="vote-counter">
              <CategoryCircledIcon size={24} paddingTop={0} paddingLeft={6}>
                <Icon name={ICON_NAME.like} size={14} color={colors.secondaryGray} />
              </CategoryCircledIcon>
              <FormattedMessage
                id={isInterpellation ? 'interpellation.support.count' : 'proposal.vote.count'}
                values={{
                  num: votesCount,
                }}
              />
            </div>
            {proposal && proposal.votes && showPoints && (
              <MetadataRow
                categorySize={24}
                categoryPaddingLeft={5}
                categoryPaddingTop={0}
                name={ICON_NAME.trophy}
                size={14}
                paddingTop={0}
                paddingLeft={3}
                color={colors.secondaryGray}
                ready={!!proposal}
                content={intl.formatMessage(
                  { id: 'count-points' },
                  { num: proposal.votes.totalPointsCount },
                )}
              />
            )}
          </p>

          {voteThreshold && voteThreshold > 0 ? (
            <>
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
            </>
          ) : null}
        </ProposalPageVoteThresholdContainer>
      </Card>
    );
  }
}
const container = injectIntl(ProposalPageVoteThreshold);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalPageVoteThreshold_proposal on Proposal
      @argumentDefinitions(stepId: { type: "ID!" }) {
      votes(stepId: $stepId, first: 0) {
        totalCount
        totalPointsCount
      }
      ...interpellationLabelHelper_proposal @relay(mask: false)
    }
  `,
  step: graphql`
    fragment ProposalPageVoteThreshold_step on Step {
      ... on CollectStep {
        voteThreshold
      }
      ... on SelectionStep {
        voteThreshold
      }
    }
  `,
});
