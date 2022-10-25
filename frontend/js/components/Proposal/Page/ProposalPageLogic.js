// @flow
import React, { useState, useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useScrollYPosition } from 'react-use-scroll-position';
import styled, { type StyledComponent } from 'styled-components';
import { Tab } from 'react-bootstrap';
import { useResize } from '@liinkiing/react-hooks'; // TODO: find a better library
import { Box } from '@cap-collectif/ui';
import colors from '~/utils/colors';
import ProposalPageHeader from './Header/ProposalPageHeader';
import ProposalPageTabs from './ProposalPageTabs';
import ProposalAnalysisPanel from '../Analysis/ProposalAnalysisPanel';
import type { ProposalPageLogic_query$key } from '~relay/ProposalPageLogic_query.graphql';
import { bootstrapGrid } from '~/utils/sizes';
import ProposalAnalysisOnMobileModal from '../Analysis/ProposalAnalysisOnMobileModal';
import ProposalPageAside from './Aside/ProposalPageAside';
import ProposalPageMainContent from './MainContent/ProposalPageMainContent';
import ProposalPageVotes from './Votes/ProposalPageVotes';
import ProposalPageBlog from './Blog/ProposalPageBlog';
import ProposalPageFollowers from './Followers/ProposalPageFollowers';
import ProposalDraftAlert from './ProposalDraftAlert';
import ProposalVoteBasketWidget from '../Vote/ProposalVoteBasketWidget';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

export type Props = {|
  queryRef: ?ProposalPageLogic_query$key,
  hasVotableStep: boolean,
  isAuthenticated: boolean,
  platformLocale: string,
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
> = styled.div.attrs(({ bottom, scrollY }) => ({
  style: {
    bottom: bottom < 0 && scrollY && `${-bottom}px`,
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
  position: ${({ scrollY }) => (scrollY >= 25 || !scrollY ? 'fixed' : 'absolute')};
  background: white;
  left: calc(50% + 142px);
  transition: width 0.5s;
  overflow: hidden;
  width: 100%;
`;

type MODAL_STATE = 'TRUE' | 'FALSE' | 'SHOWED';

const FRAGMENT = graphql`
  fragment ProposalPageLogic_query on Query
  @argumentDefinitions(
    proposalSlug: { type: "String!" }
    hasVotableStep: { type: "Boolean!" }
    stepId: { type: "ID!" }
    count: { type: "Int!" }
    cursor: { type: "String" }
    isAuthenticated: { type: "Boolean!" }
    proposalRevisionsEnabled: { type: "Boolean!" }
    token: { type: "String" }
  ) {
    viewer @include(if: $isAuthenticated) {
      id
      ...ProposalAnalysisPanel_viewer
      ...ProposalPageHeader_viewer @arguments(hasVotableStep: $hasVotableStep)
      ...ProposalVoteBasketWidget_viewer @arguments(stepId: $stepId) @include(if: $hasVotableStep)
    }
    step: node(id: $stepId) @include(if: $hasVotableStep) {
      ... on ProposalStep {
        isProposalSmsVoteEnabled
      }
      ...ProposalPageHeader_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
      ...ProposalPageTabs_step
      ...ProposalVoteBasketWidget_step @arguments(token: $token)
    }
    proposal: proposalFromSlug(slug: $proposalSlug) {
      ...ProposalPageAside_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
      ...ProposalDraftAlert_proposal
      ...ProposalPageMainContent_proposal @arguments(isAuthenticated: $isAuthenticated)
      ...ProposalPageAlert_proposal
      ...ProposalPageTabs_proposal
      ...ProposalPageVotes_proposal
      ...ProposalPageBlog_proposal
      ...ProposalPageFollowers_proposal
      ...ProposalPageHeader_proposal
        @arguments(
          isAuthenticated: $isAuthenticated
          proposalRevisionsEnabled: $proposalRevisionsEnabled
        )
      ...ProposalPageMainAside_proposal
        @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
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
          canDisplayBallot
          slug
          votable
          state
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
`;

export const ProposalPageLogic = ({ queryRef, isAuthenticated, platformLocale }: Props) => {
  const query = useFragment(FRAGMENT, queryRef);
  const { width, height } = useResize();
  const [tabKey, setTabKey] = useState('content');
  const isMobile = width < bootstrapGrid.smMax;
  const scrollY: number = useScrollYPosition();
  const footerSize = document.getElementsByTagName('footer')[0]?.offsetHeight;
  const bodyHeight = document.getElementsByTagName('body')[0]?.offsetHeight;
  const proposal = query?.proposal;
  const step = query?.step || null;
  const currentVotableStep = proposal?.currentVotableStep || null;
  const viewer = query?.viewer || null;
  const hasAnalysis =
    (proposal?.viewerCanDecide ||
      proposal?.viewerCanAnalyse ||
      proposal?.viewerCanEvaluate ||
      proposal?.supervisor?.id === query?.viewer?.id) &&
    isAuthenticated;
  const [votesCount, setVotesCount] = useState<number>(proposal?.allVotes?.totalCount || 0);
  const [show, setShow] = useState<MODAL_STATE>('FALSE');
  const [isAnalysing, setIsAnalysing] = useState(hasAnalysis);
  const bottom = bodyHeight - scrollY - height - footerSize;

  const twilio = useFeatureFlag('twilio');
  const proposalSmsVote = useFeatureFlag('proposal_sms_vote');
  const smsVoteEnabled =
    step?.isProposalSmsVoteEnabled && twilio && proposalSmsVote && !isAuthenticated;
  const showVotesWidget =
    (isAuthenticated || smsVoteEnabled) &&
    currentVotableStep &&
    currentVotableStep.state === 'OPENED';

  useEffect(() => {
    setVotesCount(proposal?.allVotes?.totalCount || 0);
  }, [proposal]);

  useEffect(() => {
    if (show !== 'SHOWED') setShow(viewer && isMobile && hasAnalysis ? 'TRUE' : 'FALSE');
  }, [show, viewer, hasAnalysis, isMobile]);

  return (
    <>
      {showVotesWidget && <ProposalVoteBasketWidget step={step} viewer={viewer} />}
      <Box bg="white" pt={[0, 5]}>
        <ProposalDraftAlert proposal={proposal} message="draft-visible-by-you" />
      </Box>
      <Tab.Container
        id="proposal-page-tabs"
        activeKey={tabKey}
        onSelect={key => setTabKey(key)}
        className="tabs__container">
        <PageContainer>
          <ProposalPageHeader
            hasAnalysingButton={hasAnalysis && !isAnalysing && !isMobile}
            onAnalysisClick={() => setIsAnalysing(true)}
            proposal={proposal}
            step={step}
            viewer={viewer}
            platformLocale={platformLocale}
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
                {proposal && (
                  <ProposalPageAside
                    proposal={proposal}
                    isAnalysing={(proposal && isAnalysing && hasAnalysis) || isMobile}
                    isAuthenticated={isAuthenticated}
                  />
                )}
              </ProposalPageBody>
            </Tab.Pane>
            {proposal?.currentVotableStep?.canDisplayBallot && (
              <Tab.Pane eventKey="votes">
                <ProposalPageVotes proposal={proposal} setGlobalVotesCount={setVotesCount} />
              </Tab.Pane>
            )}
            <Tab.Pane eventKey="blog">
              <ProposalPageBody className="d-flex">
                <ProposalPageBlog proposal={proposal} />
                {proposal && (
                  <ProposalPageAside
                    proposal={proposal}
                    isAnalysing={(proposal && isAnalysing && hasAnalysis) || isMobile}
                    isAuthenticated={isAuthenticated}
                    isActualityTab
                  />
                )}
              </ProposalPageBody>
            </Tab.Pane>
            <Tab.Pane eventKey="followers">
              <ProposalPageFollowers proposal={proposal} pageAdmin={false} />
            </Tab.Pane>
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
            viewer={viewer}
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

export default ProposalPageLogic;
