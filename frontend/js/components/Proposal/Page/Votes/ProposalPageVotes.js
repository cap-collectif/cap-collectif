// @flow
import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchQuery_DEPRECATED } from 'relay-runtime';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { Menu, Button } from '@cap-collectif/ui';
import colors from '~/utils/colors';
import environment from '~/createRelayEnvironment';
import type { ProposalPageVotes_proposal } from '~relay/ProposalPageVotes_proposal.graphql';
import ProposalVotesByStep from './ProposalVotesByStep';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { CategoryCircledIcon, CategoryTitle } from '~/components/Proposal/Page/ProposalPage.style';
import type {
  ProposalPageVotesTotalCountQueryResponse,
  ProposalPageVotesTotalCountQueryVariables,
} from '~relay/ProposalPageVotesTotalCountQuery.graphql';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {|
  +proposal: ProposalPageVotes_proposal,
  +setGlobalVotesCount: number => void,
|};

type Step = {|
  +id: string,
  +title: string,
|};

const ProposalPageVotesContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  max-width: 950px;
  margin: auto;
  padding: 10px;

  div[class*='CategoryTitle'] {
    margin-bottom: 20px;

    @media (min-width: 768px) {
      margin-bottom: 0;
    }
  }

  > div:first-child {
    @media (min-width: 768px) {
      display: flex;
    }

    justify-content: space-between;
    margin-bottom: 20px;
  }

  a.excerpt {
    /* see #11214 */
    /* stylelint-disable */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
    visibility: visible;
  }
`;

const StepSelect: StyledComponent<{}, {}, typeof Button> = styled(Button)`
  background: none !important;
  border: none;
  box-shadow: none !important;
  color: ${colors.darkText} !important;
  white-space: nowrap;
  font-weight: 400 !important;

  &:hover,
  &:focus {
    background: none !important;
  }
`;

const query = graphql`
  query ProposalPageVotesTotalCountQuery($proposalId: ID!, $stepId: ID!) {
    proposal: node(id: $proposalId) {
      ... on Proposal {
        id
        allVotes: votes(first: 0, stepId: $stepId) {
          totalCount
        }
      }
    }
  }
`;

export const ProposalPageVotes = ({ proposal, setGlobalVotesCount }: Props) => {
  const intl = useIntl();
  const [selectedStep, setSelectedStep] = useState<?Step>(proposal?.votableSteps[0]);
  const [votesCount, setVotesCount] = useState<number>(proposal?.allVotes?.totalCount || 0);
  const showVotesTab = votesCount > 0 || proposal?.currentVotableStep !== null;
  const paperVotesTotalCount = proposal?.paperVotesTotalCount ?? 0;
  const votesTotalCount = votesCount + paperVotesTotalCount;
  const unstable__paper_vote = useFeatureFlag('unstable__paper_vote');

  useEffect(() => {
    setVotesCount(proposal?.allVotes?.totalCount || 0);
  }, [proposal]);

  if (!proposal) return null;
  return (
    showVotesTab && (
      <ProposalPageVotesContainer id="ProposalPageVotes">
        <div>
          <CategoryTitle>
            <CategoryCircledIcon paddingLeft={8}>
              <Icon name={ICON_NAME.like} size={20} color={colors.secondaryGray} />
            </CategoryCircledIcon>
            <h3>
              <FormattedMessage values={{ num: votesTotalCount }} id="proposal.vote.count" />
            </h3>
            {unstable__paper_vote ? (
              <h5>
                {intl.formatMessage(
                  { id: 'paper-and-numeric-distribution' },
                  { numericVotesCount: votesCount, paperVotesCount: paperVotesTotalCount },
                )}
              </h5>
            ) : (
              <h5>
                {intl.formatMessage(
                  { id: 'numeric-distribution' },
                  { numericVotesCount: votesCount },
                )}
              </h5>
            )}
          </CategoryTitle>
          {proposal.votableSteps.length > 1 && (
            <Menu
              disclosure={
                <StepSelect
                  id={`proposal-votes-select-step-${proposal.id}`}
                  variant="tertiary"
                  variantColor="hierarchy">
                  <Icon
                    style={{ marginRight: '4px' }}
                    name={ICON_NAME.filter}
                    size={18}
                    color={colors.black}
                  />
                  <span>{selectedStep?.title}</span>
                </StepSelect>
              }>
              <Menu.List>
                {proposal.votableSteps.map((votableStep, index) => (
                  <Menu.Item
                    border="none"
                    backgroundColor="transparent"
                    key={index}
                    onClick={() => {
                      setSelectedStep(votableStep);
                      fetchQuery_DEPRECATED(
                        environment,
                        query,
                        ({
                          proposalId: proposal.id,
                          stepId: votableStep.id,
                        }: ProposalPageVotesTotalCountQueryVariables),
                      ).then((data: ProposalPageVotesTotalCountQueryResponse) => {
                        setVotesCount(data?.proposal?.allVotes?.totalCount || 0);
                        setGlobalVotesCount(data?.proposal?.allVotes?.totalCount || 0);
                      });
                    }}>
                    {votableStep.title}
                  </Menu.Item>
                ))}
              </Menu.List>
            </Menu>
          )}
        </div>

        {selectedStep && <ProposalVotesByStep stepId={selectedStep.id} proposal={proposal} />}
      </ProposalPageVotesContainer>
    )
  );
};

export default createFragmentContainer(ProposalPageVotes, {
  proposal: graphql`
    fragment ProposalPageVotes_proposal on Proposal {
      id
      allVotes: votes(first: 0, stepId: $stepId) {
        totalCount
      }
      paperVotesTotalCount
      votableSteps {
        id
        title
      }
      currentVotableStep {
        id
      }
    }
  `,
});
