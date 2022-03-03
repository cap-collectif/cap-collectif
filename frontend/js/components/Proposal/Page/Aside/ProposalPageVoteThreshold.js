// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { useIntl } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { ProgressBar } from 'react-bootstrap';
import { Box } from '@cap-collectif/ui';
import type { ProposalPageVoteThreshold_step } from '~relay/ProposalPageVoteThreshold_step.graphql';
import type { ProposalPageVoteThreshold_proposal } from '~relay/ProposalPageVoteThreshold_proposal.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';
import { Card, CategoryCircledIcon } from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import Tooltip from '~ds/Tooltip/Tooltip';
import Text from '~ui/Primitives/Text';

type Props = {
  proposal: ProposalPageVoteThreshold_proposal,
  step: ProposalPageVoteThreshold_step,
  showPoints: boolean,
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

export const ProposalPageVoteThreshold = ({ step, proposal, showPoints }: Props) => {
  const intl = useIntl();
  const numericVotesTotalCount = proposal?.votes?.totalCount ?? 0;
  const paperVotesTotalCount = proposal?.paperVotesTotalCount ?? 0;
  const votesTotalCount = numericVotesTotalCount + paperVotesTotalCount;
  const numericVotesTotalPointsCount = proposal?.votes?.totalPointsCount ?? 0;
  const paperVotesTotalPointsCount = proposal?.paperVotesTotalPointsCount ?? 0;
  const votesTotalPointsCount = numericVotesTotalPointsCount + paperVotesTotalPointsCount;
  const { voteThreshold } = step;
  let votesRemaining = 0;
  let votesPercentage = 0;
  if (voteThreshold !== null && typeof voteThreshold !== 'undefined' && voteThreshold > 0) {
    votesRemaining = voteThreshold - votesTotalCount;
    votesPercentage = Math.ceil((votesTotalCount * 100) / voteThreshold);
  }
  const isInterpellation = isInterpellationContextFromProposal(proposal);
  return (
    <Card id="ProposalPageVoteThreshold">
      <ProposalPageVoteThresholdContainer>
        <h4>
          {voteThreshold && votesPercentage >= 100
            ? intl.formatMessage({
                id: isInterpellation
                  ? 'interpellation.vote.threshold.reached'
                  : 'proposal.vote.threshold.reached',
              })
            : intl.formatMessage({
                id: isInterpellation
                  ? 'interpellation.support.threshold.title'
                  : 'proposal.vote.threshold.title',
              })}
        </h4>
        <p>
          <Tooltip
            backgroundColor="black"
            borderRadius="4px"
            zIndex={10}
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
                    {intl.formatMessage({ id: 'paper-votes-count' }, { num: paperVotesTotalCount })}
                  </Text>
                )}
              </>
            }>
            <div className="vote-counter">
              <CategoryCircledIcon size={24} paddingTop={0} paddingLeft={6}>
                <Icon name={ICON_NAME.like} size={14} color={colors.secondaryGray} />
              </CategoryCircledIcon>
              <Box ml="3">
                {intl.formatMessage(
                  { id: isInterpellation ? 'interpellation.support.count' : 'proposal.vote.count' },
                  { num: votesTotalCount },
                )}
              </Box>
            </div>
          </Tooltip>
          {proposal && votesTotalPointsCount > 0 && showPoints && (
            <>
              {paperVotesTotalPointsCount > 0 ? (
                <Tooltip
                  backgroundColor="black"
                  borderRadius="4px"
                  zIndex={10}
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
                      <Text textAlign="center" lineHeight="sm" fontSize={1} fontFamily="OpenSans">
                        {intl.formatMessage(
                          { id: 'paper-points-count' },
                          { num: paperVotesTotalPointsCount },
                        )}
                      </Text>
                    </>
                  }>
                  <div className="vote-counter">
                    <CategoryCircledIcon size={24} paddingTop={0} paddingLeft={5}>
                      <Icon name={ICON_NAME.trophy} size={14} color={colors.secondaryGray} />
                    </CategoryCircledIcon>
                    <Box ml="3">
                      {intl.formatMessage({ id: 'count-points' }, { num: votesTotalPointsCount })}
                    </Box>
                  </div>
                </Tooltip>
              ) : (
                <div className="vote-counter">
                  <CategoryCircledIcon size={24} paddingTop={0} paddingLeft={5}>
                    <Icon name={ICON_NAME.trophy} size={14} color={colors.secondaryGray} />
                  </CategoryCircledIcon>
                  <Box ml="3">
                    {intl.formatMessage({ id: 'count-points' }, { num: votesTotalPointsCount })}
                  </Box>
                </div>
              )}
            </>
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
              {votesPercentage >= 100 &&
                intl.formatMessage(
                  {
                    id: isInterpellation
                      ? 'interpellation.support.threshold.progress_reached'
                      : 'proposal.vote.threshold.progress_reached',
                  },
                  {
                    num: votesTotalCount,
                    max: voteThreshold,
                  },
                )}
              {votesPercentage < 100 &&
                intl.formatMessage(
                  {
                    id: isInterpellation
                      ? 'interpellation.support.threshold.progress'
                      : 'proposal.vote.threshold.progress',
                  },
                  {
                    num: votesRemaining,
                    max: voteThreshold,
                  },
                )}
            </div>
          </>
        ) : null}
      </ProposalPageVoteThresholdContainer>
    </Card>
  );
};

export default createFragmentContainer(ProposalPageVoteThreshold, {
  proposal: graphql`
    fragment ProposalPageVoteThreshold_proposal on Proposal
    @argumentDefinitions(stepId: { type: "ID!" }) {
      votes(stepId: $stepId, first: 0) {
        totalCount
        totalPointsCount
      }
      paperVotesTotalCount
      paperVotesTotalPointsCount
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
