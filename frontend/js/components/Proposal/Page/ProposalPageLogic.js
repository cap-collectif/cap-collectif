// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { useScrollYPosition } from 'react-use-scroll-position';
import styled, { type StyledComponent } from 'styled-components';
import { Tab } from 'react-bootstrap';
import { useResize } from '@liinkiing/react-hooks'; // TODO: find a better library
import colors from '~/utils/colors';
import ProposalVoteBasketWidget from '~/components/Proposal/Vote/ProposalVoteBasketWidget';
import ProposalPageHeader from './Header/ProposalPageHeader';
import ProposalPageTabs from './ProposalPageTabs';
import type { FeatureToggles, State } from '~/types';
import ProposalAnalysisPanel from '../Analysis/ProposalAnalysisPanel';
import type { ProposalPageLogic_query } from '~relay/ProposalPageLogic_query.graphql';
import { bootstrapGrid } from '~/utils/sizes';
import ProposalAnalysisOnMobileModal from '../Analysis/ProposalAnalysisOnMobileModal';
import ProposalPageAside from './Aside/ProposalPageAside';
import ProposalPageMainContent from './MainContent/ProposalPageMainContent';
import ProposalPageVotes from './Votes/ProposalPageVotes';
import ProposalPageBlog from './Blog/ProposalPageBlog';
import ProposalPageFollowers from './Followers/ProposalPageFollowers';
import ProposalDraftAlert from './ProposalDraftAlert';
import ProposalPageDonators from '~/components/Proposal/Page/Donators/ProposalPageDonators';
import AppBox from '~/components/Ui/Primitives/AppBox';

export type Props = {|
  query: ProposalPageLogic_query,
  title: string,
  features: FeatureToggles,
  isAuthenticated: boolean,
  opinionCanBeFollowed: boolean,
  hasVotableStep: boolean,
  votesPageUrl: string,
  image: string,
  showVotesWidget: boolean,
|};

export const PageContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background: ${colors.pageBgc};
`;

const ProposalPageBody: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  max-width: 950px;
  margin: auto;
`;

const PanelContainer: StyledComponent<
  {
    isAnalysing: boolean,
    scrollY: number,
    bottom: number,
    hasVoteBar: boolean,
  },
  {},
  HTMLDivElement,
> = styled.div.attrs(({ bottom }) => ({
  style: {
    bottom: bottom < 0 && `${-bottom}px`,
  },
}))`
  display: ${({ isAnalysing }) => !isAnalysing && 'none'};
  box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.12);
  height: 100%;
  z-index: 4;
  top: ${({ scrollY, bottom, hasVoteBar }) =>
    bottom < 0
      ? 'unset'
      : scrollY < 25
      ? hasVoteBar
        ? '125px'
        : '75px'
      : hasVoteBar
      ? '100px'
      : '50px'};
  position: ${({ scrollY }) => (scrollY >= 25 ? 'fixed' : 'absolute')};
  background: white;
  left: calc(50% + 142px);
  transition: width 0.5s;
  overflow: hidden;
  width: 100%;
`;

type MODAL_STATE = 'TRUE' | 'FALSE' | 'SHOWED';

export const ProposalPageLogic = ({
  query,
  title,
  features,
  isAuthenticated,
  opinionCanBeFollowed,
  hasVotableStep,
  votesPageUrl,
  image,
  showVotesWidget,
}: Props) => {
  const { width, height } = useResize();
  const [tabKey, setTabKey] = useState('content');
  const isMobile = width < bootstrapGrid.smMax;
  const scrollY: number = useScrollYPosition();
  const footerSize = document.getElementsByTagName('footer')[0]?.offsetHeight;
  const bodyHeight = document.getElementsByTagName('body')[0]?.offsetHeight;
  const proposal = query?.proposal || null;
  const step = query?.step || null;
  const viewer = query?.viewer || null;
  const hasAnalysis =
    (proposal?.viewerCanDecide ||
      proposal?.viewerCanAnalyse ||
      proposal?.viewerCanEvaluate ||
      proposal?.supervisor?.id === query?.viewer?.id) &&
    features.unstable__analysis &&
    isAuthenticated;
  const [votesCount, setVotesCount] = useState<number>(proposal?.allVotes?.totalCount || 0);
  const [show, setShow] = useState<MODAL_STATE>('FALSE');
  const [isAnalysing, setIsAnalysing] = useState(hasAnalysis);
  const bottom = bodyHeight - scrollY - height - footerSize;

  useEffect(() => {
    setVotesCount(proposal?.allVotes?.totalCount || 0);
  }, [proposal]);

  useEffect(() => {
    if (show !== 'SHOWED') setShow(viewer && isMobile && hasAnalysis ? 'TRUE' : 'FALSE');
  }, [show, viewer, hasAnalysis, isMobile]);

  return (
    <>
      {proposal && step && showVotesWidget && (
        <ProposalVoteBasketWidget
          step={step}
          viewer={viewer}
          image={image}
          votesPageUrl={votesPageUrl}
        />
      )}
      <AppBox bg="white" pt={[0, 5]}>
        <ProposalDraftAlert proposal={proposal} message="draft-visible-by-you" />
      </AppBox>
      <Tab.Container
        id="proposal-page-tabs"
        activeKey={tabKey}
        onSelect={key => setTabKey(key)}
        className="tabs__container">
        <PageContainer>
          <ProposalPageHeader
            hasAnalysingButton={hasAnalysis && !isAnalysing && !isMobile}
            onAnalysisClick={() => setIsAnalysing(true)}
            title={title}
            proposal={proposal}
            step={step}
            viewer={viewer}
            opinionCanBeFollowed={opinionCanBeFollowed}
            hasVotableStep={hasVotableStep}
          />
          <ProposalPageTabs
            proposal={proposal}
            step={step}
            tabKey={tabKey}
            votesCount={votesCount}
          />
          <Tab.Content animation={false}>
            <Tab.Pane eventKey="content">
              <ProposalPageBody className="d-flex">
                <ProposalPageMainContent
                  proposal={proposal}
                  goToBlog={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTabKey('blog');
                  }}
                  isAnalysing={(proposal && isAnalysing && hasAnalysis) || false}
                />
                <ProposalPageAside
                  proposal={proposal}
                  isAnalysing={(proposal && isAnalysing && hasAnalysis) || isMobile}
                  hasVotableStep={hasVotableStep}
                  isAuthenticated={isAuthenticated}
                />
              </ProposalPageBody>
            </Tab.Pane>
            <Tab.Pane eventKey="votes">
              {proposal && (
                <ProposalPageVotes proposal={proposal} setGlobalVotesCount={setVotesCount} />
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="blog">
              <ProposalPageBody className="d-flex">
                <ProposalPageBlog proposal={proposal} />
                <ProposalPageAside
                  proposal={proposal}
                  isAnalysing={(proposal && isAnalysing && hasAnalysis) || isMobile}
                  hasVotableStep={hasVotableStep}
                  isAuthenticated={isAuthenticated}
                  isActualityTab
                />
              </ProposalPageBody>
            </Tab.Pane>
            <Tab.Pane eventKey="followers">
              <ProposalPageFollowers proposal={proposal} pageAdmin={false} />
            </Tab.Pane>
            {features.unstable__tipsmeee && (
              <Tab.Pane eventKey="donators">
                <ProposalPageDonators proposal={proposal} />
              </Tab.Pane>
            )}
          </Tab.Content>
        </PageContainer>
      </Tab.Container>
      {hasAnalysis && !isMobile && proposal && tabKey === 'content' && (
        <PanelContainer
          isAnalysing={isAnalysing}
          scrollY={scrollY}
          bottom={bottom}
          hasVoteBar={showVotesWidget}>
          <ProposalAnalysisPanel
            proposal={proposal}
            onClose={() => setIsAnalysing(false)}
            isAnalysing={isAnalysing}
          />
        </PanelContainer>
      )}
      <ProposalAnalysisOnMobileModal
        show={show === 'TRUE' || false}
        onClose={() => setShow('SHOWED')}
      />
    </>
  );
};

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
  features: state.default.features,
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPageLogic),
  {
    query: graphql`
      fragment ProposalPageLogic_query on Query
        @argumentDefinitions(
          proposalId: { type: "ID!" }
          hasVotableStep: { type: "Boolean!" }
          stepId: { type: "ID!" }
          count: { type: "Int!" }
          cursor: { type: "String" }
          isAuthenticated: { type: "Boolean!" }
          isTipsMeeeEnabled: { type: "Boolean!" }
          proposalRevisionsEnabled: { type: "Boolean!" }
        ) {
        viewer @include(if: $isAuthenticated) {
          id
          ...ProposalPageHeader_viewer @arguments(hasVotableStep: $hasVotableStep)
          ...ProposalVoteBasketWidget_viewer
            @arguments(stepId: $stepId)
            @include(if: $hasVotableStep)
        }
        step: node(id: $stepId) @include(if: $hasVotableStep) {
          ...ProposalPageHeader_step @arguments(isAuthenticated: $isAuthenticated)
          ...ProposalPageTabs_step
          ...ProposalVoteBasketWidget_step @arguments(isAuthenticated: $isAuthenticated)
        }
        proposal: node(id: $proposalId) {
          ...ProposalPageAside_proposal
            @arguments(stepId: $stepId, isTipsMeeeEnabled: $isTipsMeeeEnabled)
          ...ProposalDraftAlert_proposal
          ...ProposalPageMainContent_proposal @arguments(isTipsMeeeEnabled: $isTipsMeeeEnabled)
          ...ProposalPageAlert_proposal
          ...ProposalPageTabs_proposal
            @arguments(stepId: $stepId, isTipsMeeeEnabled: $isTipsMeeeEnabled)
          ...ProposalPageVotes_proposal
          ...ProposalPageBlog_proposal
          ...ProposalPageFollowers_proposal
          ...ProposalPageDonators_proposal @arguments(isTipsMeeeEnabled: $isTipsMeeeEnabled)
          ...ProposalPageHeader_proposal
            @arguments(
              isAuthenticated: $isAuthenticated
              proposalRevisionsEnabled: $proposalRevisionsEnabled
              isTipsMeeeEnabled: $isTipsMeeeEnabled
            )
          ...ProposalPageMainAside_proposal
            @arguments(stepId: $stepId, isTipsMeeeEnabled: $isTipsMeeeEnabled)
            @include(if: $isAuthenticated)
          ...ProposalAnalysisPanel_proposal
            @arguments(proposalRevisionsEnabled: $proposalRevisionsEnabled)
            @include(if: $isAuthenticated)
          ... on Proposal {
            id
            supervisor {
              id
            }
            currentVotableStep {
              id
            }
            allVotes: votes(first: 0, stepId: $stepId) {
              totalCount
            }
            viewerCanDecide @include(if: $isAuthenticated)
            viewerCanAnalyse @include(if: $isAuthenticated)
            viewerCanEvaluate @include(if: $isAuthenticated)
          }
        }
      }
    `,
  },
);
