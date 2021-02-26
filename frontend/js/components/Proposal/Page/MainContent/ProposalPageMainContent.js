// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { connect } from 'react-redux';
import type { ProposalPageMainContent_proposal } from '~relay/ProposalPageMainContent_proposal.graphql';
import ProposalPageFusionInformations from './ProposalPageFusionInformations';
import ProposalPageDescription from './ProposalPageDescription';
import ProposalPageLocalisation from './ProposalPageLocalisation';
import ProposalPageTopDonators from '~/components/Proposal/Page/MainContent/ProposalPageTopDonators';
import ProposalPageNews from './ProposalPageNews';
import ProposalPageDiscussions from './ProposalPageDiscussions';
import ProposalPageOfficialAnswer from './ProposalPageOfficialAnswer';
import ProposalPageCustomSections from './ProposalPageCustomSections';
import ProposalPageMainAside from './ProposalPageMainAside';
import { bootstrapGrid } from '~/utils/sizes';
import type { FeatureToggles, GlobalState } from '~/types';
import ProposalTipsMeeeDonatorsAside from '~/components/Proposal/Page/Aside/ProposalTipsMeeeDonatorsAside';

type Props = {|
  +proposal: ?ProposalPageMainContent_proposal,
  goToBlog: () => void,
  isAnalysing: boolean,
  features: FeatureToggles,
|};

const ProposalPageMainContentContainer: StyledComponent<
  { usingTipsmeee: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  width: 100%;
  min-height: ${({ usingTipsmeee }) => (usingTipsmeee ? '1000px' : 'auto')};
  @media (min-width: ${bootstrapGrid.mdMin}px) {
    max-width: 587px;
  }

  > .Card {
    margin: 15px;
    @media (min-width: ${bootstrapGrid.mdMin}px) {
      margin: 0;
      margin-bottom: 30px;
    }
  }
`;

const DonatorContent: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  @media (min-width: ${bootstrapGrid.mdMin}px) {
    display: none;
  }
  @media (max-width: ${bootstrapGrid.mdMin}px) {
    display: flex;
    margin: 15px;
    #ProposalTipsMeeeDonators {
      width: 100%;
    }
  }
`;

export const ProposalPageMainContent = ({ proposal, goToBlog, isAnalysing, features }: Props) => (
  <ProposalPageMainContentContainer
    usingTipsmeee={features.unstable__tipsmeee && proposal && proposal.tipsmeeeId}
    id={proposal ? 'ProposalPageMainContent' : 'ProposalPageMainContentLoading'}>
    <ProposalPageFusionInformations proposal={proposal} />
    <ProposalPageOfficialAnswer proposal={proposal} />
    {proposal && features.unstable__tipsmeee && (
      <DonatorContent>
        <ProposalTipsMeeeDonatorsAside proposal={proposal} />
      </DonatorContent>
    )}
    <ProposalPageDescription proposal={proposal} />
    <ProposalPageLocalisation proposal={proposal} />
    {features.unstable__tipsmeee && <ProposalPageTopDonators proposal={proposal} />}
    <ProposalPageCustomSections proposal={proposal} />
    <ProposalPageMainAside proposal={proposal} display={isAnalysing} />
    <ProposalPageNews proposal={proposal} goToBlog={goToBlog} />
    <ProposalPageDiscussions proposal={proposal} />
  </ProposalPageMainContentContainer>
);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPageMainContent),
  {
    proposal: graphql`
      fragment ProposalPageMainContent_proposal on Proposal
        @argumentDefinitions(isTipsMeeeEnabled: { type: "Boolean!" }) {
        tipsmeeeId @include(if: $isTipsMeeeEnabled)
        ...ProposalPageFusionInformations_proposal
        ...ProposalPageTopDonators_proposal @include(if: $isTipsMeeeEnabled)
        ...ProposalPageOfficialAnswer_proposal
        ...ProposalPageDescription_proposal
        ...ProposalPageLocalisation_proposal
        ...ProposalPageCustomSections_proposal
        ...ProposalTipsMeeeDonatorsAside_proposal @include(if: $isTipsMeeeEnabled)
        ...ProposalPageMainAside_proposal
          @arguments(stepId: $stepId, isTipsMeeeEnabled: $isTipsMeeeEnabled)
        ...ProposalPageNews_proposal @arguments(isAuthenticated: $isAuthenticated)
        ...ProposalPageDiscussions_proposal
        ...ProposalVoteButtonWrapperFragment_proposal
          @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
        ...ProposalPageComments_proposal
        ...ProposalReportButton_proposal @arguments(isAuthenticated: $isAuthenticated)
      }
    `,
  },
);
