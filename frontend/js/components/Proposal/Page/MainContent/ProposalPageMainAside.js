// @flow
import React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import ProposalPageMetadata from '~/components/Proposal/Page/Aside/ProposalPageMetadata';
import ProposalPageVoteThreshold from '~/components/Proposal/Page/Aside/ProposalPageVoteThreshold';
import ProposalPageAdvancement from '~/components/Proposal/Page/Aside/ProposalPageAdvancement';
import type { ProposalPageMainAside_proposal } from '~relay/ProposalPageMainAside_proposal.graphql';
import { type GlobalState, type FeatureToggles } from '~/types';
import { bootstrapGrid } from '~/utils/sizes';
import ProposalTipsMeeeAside from '~/components/Proposal/Page/Aside/ProposalTipsMeeeAside';

type Props = {
  proposal: ProposalPageMainAside_proposal,
  features: FeatureToggles,
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

export const ProposalPageMainAside = ({ proposal, features, display }: Props) => {
  const currentVotableStep = proposal?.currentVotableStep;
  return (
    <Container display={display}>
      <div>
        <ProposalPageMetadata
          proposal={proposal}
          showDistricts={features.districts || false}
          showCategories={proposal?.form?.usingCategories}
          showNullEstimation={!!(currentVotableStep && currentVotableStep.voteType === 'BUDGET')}
          showThemes={(features.themes || false) && proposal?.form?.usingThemes}
        />
        {currentVotableStep !== null &&
          typeof currentVotableStep !== 'undefined' &&
          currentVotableStep.voteThreshold !== null &&
          typeof currentVotableStep.voteThreshold !== 'undefined' &&
          currentVotableStep.voteThreshold > 0 && (
            <ProposalPageVoteThreshold
              proposal={proposal}
              step={currentVotableStep}
              showPoints={(currentVotableStep && currentVotableStep.votesRanking) || false}
            />
          )}
      </div>
      <ProposalPageAdvancement proposal={proposal} />
      {proposal && proposal.form.usingTipsmeee && features.unstable__tipsmeee && (
        <ProposalTipsMeeeAside proposal={proposal} />
      )}
    </Container>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(ProposalPageMainAside), {
  proposal: graphql`
    fragment ProposalPageMainAside_proposal on Proposal
      @argumentDefinitions(stepId: { type: "ID!" }, isTipsMeeeEnabled: { type: "Boolean!" }) {
      id
      ...ProposalPageMetadata_proposal
      ...ProposalPageAdvancement_proposal
      ...ProposalTipsMeeeAside_proposal @include(if: $isTipsMeeeEnabled)
      ...ProposalPageVoteThreshold_proposal @arguments(stepId: $stepId)
      currentVotableStep {
        id
        votesRanking
        voteType
        voteThreshold
        ...ProposalPageVoteThreshold_step
      }
      form {
        usingCategories
        usingThemes
        usingTipsmeee @include(if: $isTipsMeeeEnabled)
      }
    }
  `,
});
