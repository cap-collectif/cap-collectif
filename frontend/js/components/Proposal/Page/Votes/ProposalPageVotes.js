// @flow
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { fetchQuery } from 'relay-runtime';
import { graphql, createFragmentContainer } from 'react-relay';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
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

type Props = {|
  +proposal: ProposalPageVotes_proposal,
  +setGlobalVotesCount: number => void,
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

const StepSelect: StyledComponent<{}, {}, typeof DropdownButton> = styled(DropdownButton)`
  background: none !important;
  border: none;
  box-shadow: none !important;

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
  const [selectedStep, setSelectedStep] = useState(proposal?.votableSteps[0]);
  const [votesCount, setVotesCount] = useState<number>(proposal?.allVotes?.totalCount || 0);
  const showVotesTab = votesCount > 0 || proposal?.currentVotableStep !== null;

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
              <FormattedMessage values={{ num: votesCount }} id="proposal.vote.count" />
            </h3>
          </CategoryTitle>
          {proposal.votableSteps.length > 1 && (
            <StepSelect
              noCaret
              pullRight
              id={`proposal-votes-select-step-${proposal.id}`}
              title={
                <span>
                  <Icon name={ICON_NAME.filter} size={18} color={colors.black} />
                  {selectedStep?.title}
                </span>
              }>
              {proposal.votableSteps.map((votableStep, index) => (
                <MenuItem
                  key={index}
                  onSelect={() => {
                    setSelectedStep(votableStep);
                    fetchQuery(
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
                </MenuItem>
              ))}
            </StepSelect>
          )}
        </div>
        <ProposalVotesByStep stepId={selectedStep.id} proposal={proposal} />
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
