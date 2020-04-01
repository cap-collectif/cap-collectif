// @flow
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { useResize } from '@liinkiing/react-hooks'; // TODO: find a better library
import ProposalPageHeader from './ProposalPageHeader';
import ProposalPageAlert from './ProposalPageAlert';
import ProposalDraftAlert from './ProposalDraftAlert';
import ProposalPageTabs from './ProposalPageTabs';
import type { FeatureToggles, State } from '~/types';
import ProposalAnalysisPanel from '../Analysis/ProposalAnalysisPanel';
import type { ProposalPageLogic_query } from '~relay/ProposalPageLogic_query.graphql';
import sizes from '~/utils/sizes';
import ProposalAnalysisOnMobileModal from '../Analysis/ProposalAnalysisOnMobileModal';

export type Props = {|
  query: ProposalPageLogic_query,
  features: FeatureToggles,
|};

export const PageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
`;

const PanelContainer: StyledComponent<
  { isAnalysing: boolean, isLarge: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  height: calc(100vh - 70px);
  z-index: 1;
  position: absolute;
  background: white;
  left: calc((100vw - (45vw - ${props => (props.isLarge ? '95px' : '120px')})));
  transition: 0.5s;
  padding-top: 30px;
  width: ${props =>
    props.isAnalysing
      ? `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`
      : '0'};
  margin-left: ${props => (props.isAnalysing ? '0' : '50%')};
`;

export const ProposalPageLogic = ({ query, features }: Props) => {
  const { width } = useResize();
  const isMobile = width < sizes.bootstrapGrid.smMax;
  const isLarge = width < sizes.bootstrapGrid.mdMax;
  const { proposal } = query;
  const hasAnalysis =
    (proposal?.viewerCanDecide || proposal?.viewerCanAnalyse || proposal?.viewerCanEvaluate) &&
    features.unstable__analysis;
  const [show, setShow] = useState(isMobile && hasAnalysis);
  const [isAnalysing, setIsAnalysing] = useState(hasAnalysis);
  if (!proposal) return null;

  return (
    <div className="d-flex">
      <ProposalAnalysisOnMobileModal show={show || false} onClose={() => setShow(false)} />
      <PageContainer>
        <ProposalDraftAlert proposal={proposal} />
        <ProposalPageAlert proposal={proposal} />
        <section className="section--custom">
          <ProposalPageHeader
            hasAnalysingButton={hasAnalysis && !isAnalysing && !isMobile}
            onAnalysisClick={() => setIsAnalysing(true)}
            proposal={proposal}
            step={query.step || null}
            viewer={query.viewer || null}
            isAuthenticated={!!query.viewer}
            className="container"
          />
        </section>
        <section className="section--custom">
          <ProposalPageTabs
            proposal={proposal}
            step={query.step || null}
            viewer={query.viewer || null}
            features={features}
          />
        </section>
      </PageContainer>
      {hasAnalysis && !isMobile && (
        <PanelContainer isAnalysing={isAnalysing} isLarge={isLarge}>
          <ProposalAnalysisPanel
            proposal={proposal}
            onClose={() => setIsAnalysing(false)}
            isAnalysing={isAnalysing}
          />
        </PanelContainer>
      )}
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(ProposalPageLogic), {
  query: graphql`
    fragment ProposalPageLogic_query on Query
      @argumentDefinitions(
        proposalId: { type: "ID!" }
        hasVotableStep: { type: "Boolean!" }
        stepId: { type: "ID!" }
        count: { type: "Int!" }
        cursor: { type: "String" }
        isAuthenticated: { type: "Boolean!" }
      ) {
      viewer @include(if: $isAuthenticated) {
        ...ProposalPageTabs_viewer
        ...ProposalPageHeader_viewer @arguments(hasVotableStep: $hasVotableStep)
      }
      step: node(id: $stepId) @include(if: $hasVotableStep) {
        ...ProposalPageHeader_step @arguments(isAuthenticated: $isAuthenticated)
        ...ProposalPageTabs_step
      }
      proposal: node(id: $proposalId) {
        ...ProposalDraftAlert_proposal
        ...ProposalPageAlert_proposal
        ...ProposalPageTabs_proposal
        ...ProposalPageHeader_proposal @arguments(isAuthenticated: $isAuthenticated)
        ...ProposalAnalysisPanel_proposal @include(if: $isAuthenticated)
        ... on Proposal {
          viewerCanDecide @include(if: $isAuthenticated)
          viewerCanAnalyse @include(if: $isAuthenticated)
          viewerCanEvaluate @include(if: $isAuthenticated)
        }
      }
    }
  `,
});
