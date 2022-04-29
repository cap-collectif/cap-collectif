// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import ProposalPageMetadata from '~/components/Proposal/Page/Aside/ProposalPageMetadata';
import ProposalPageVoteThreshold from '~/components/Proposal/Page/Aside/ProposalPageVoteThreshold';
import ProposalPageAdvancement from '~/components/Proposal/Page/Aside/ProposalPageAdvancement';
import type { ProposalPageMainAside_proposal } from '~relay/ProposalPageMainAside_proposal.graphql';
import { bootstrapGrid } from '~/utils/sizes';
import ProposalSocialNetworkLinks from '~/components/Proposal/Page/Aside/ProposalSocialNetworkLinks';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {
  proposal: ProposalPageMainAside_proposal,
  display: boolean,
};

const Container: StyledComponent<{ display: boolean }, {}, HTMLDivElement> = styled.div`
  display: ${({ display }) => (display ? 'flex' : 'none')};
  justify-content: space-between;
  margin-bottom: 30px;

  > div {
    width: 286px;
    max-width: 286px;
  }

  @media (max-width: 991px) {
    display: block;

    > div {
      max-width: unset;
      width: unset;
    }
  }

  .Card {
    margin: 15px;
    @media (min-width: ${bootstrapGrid.mdMin}px) {
      display: block;
      margin: 0;
      margin-bottom: 30px;
      width: 100%;
    }
  }
`;

export const ProposalPageMainAside = ({ proposal, display }: Props) => {
  const currentVotableStep = proposal?.currentVotableStep;
  return (
    <Container display={display}>
      <div>
        <ProposalPageMetadata
          proposal={proposal}
          showDistricts={useFeatureFlag('districts') || false}
          showCategories={proposal?.form?.usingCategories}
          showNullEstimation={!!(currentVotableStep && currentVotableStep.voteType === 'BUDGET')}
          showThemes={(useFeatureFlag('themes') || false) && proposal?.form?.usingThemes}
        />
        {currentVotableStep !== null &&
          typeof currentVotableStep !== 'undefined' &&
          currentVotableStep.voteThreshold !== null &&
          typeof currentVotableStep.voteThreshold !== 'undefined' &&
          currentVotableStep.voteThreshold > 0 &&
          currentVotableStep.canDisplayBallot && (
            <ProposalPageVoteThreshold
              proposal={proposal}
              step={currentVotableStep}
              showPoints={(currentVotableStep && currentVotableStep.votesRanking) || false}
            />
          )}
      </div>
      <ProposalPageAdvancement proposal={proposal} />
      {proposal && proposal.isProposalUsingAnySocialNetworks && (
        <ProposalSocialNetworkLinks proposal={proposal} />
      )}
    </Container>
  );
};

export default createFragmentContainer(ProposalPageMainAside, {
  proposal: graphql`
    fragment ProposalPageMainAside_proposal on Proposal
    @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
      id
      ...ProposalPageMetadata_proposal
      ...ProposalPageAdvancement_proposal
      ...ProposalPageVoteThreshold_proposal @arguments(stepId: $stepId)
      ...ProposalSocialNetworkLinks_proposal @arguments(isAuthenticated: $isAuthenticated)
      isProposalUsingAnySocialNetworks
      currentVotableStep {
        votesRanking
        voteType
        voteThreshold
        canDisplayBallot
        ...ProposalPageVoteThreshold_step
      }
      form {
        usingCategories
        usingThemes
      }
    }
  `,
});
