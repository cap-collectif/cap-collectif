// @flow
import React, { useRef } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useResize } from '@liinkiing/react-hooks';
import { useScrollYPosition } from 'react-use-scroll-position';
import styled, { type StyledComponent, css } from 'styled-components';
import type { ProposalPageAside_proposal } from '~relay/ProposalPageAside_proposal.graphql';
import ProposalPageMetadata from '~/components/Proposal/Page/Aside/ProposalPageMetadata';
import ProposalPageVoteThreshold from '~/components/Proposal/Page/Aside/ProposalPageVoteThreshold';
import ProposalSocialNetworkLinks from '~/components/Proposal/Page/Aside/ProposalSocialNetworkLinks';
import ProposalPageAdvancement from '~/components/Proposal/Page/Aside/ProposalPageAdvancement';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

const HEIGHT_WITH_VOTEBAR = 130;
const HEIGHT_WITHOUT_VOTEBAR = 80;

type Props = {
  proposal: ProposalPageAside_proposal,
  opinionCanBeFollowed: boolean,
  hasVotableStep: boolean,
  isAnalysing: boolean,
  isAuthenticated: boolean,
  isActualityTab?: boolean,
};

const Aside: StyledComponent<
  {
    isAnalysing: boolean,
    hasVoteBar: boolean,
    isFixedToTop: boolean,
    isFixedToBottom: boolean,
    isMovingUp: boolean,
  },
  {},
  HTMLElement,
> = styled.aside`
  ${({ isAnalysing, hasVoteBar, isFixedToTop, isFixedToBottom, isMovingUp }) => css`
    display: ${isAnalysing && 'none'};
    width: 300px;
    position: absolute;
    margin-left: 617px;
    z-index: 1;
    top: ${hasVoteBar ? '370px' : '320px'};
    ${isFixedToTop &&
    css`
      position: fixed;
      margin-top: unset;
      margin-left: 617px;
      top: ${hasVoteBar ? '130px' : '80px'};
    `}
    ${isFixedToBottom &&
    css`
      bottom: 10px;
      margin-top: unset;
      top: unset;
      position: fixed;
      margin-left: 617px;
    `}
    ${isMovingUp &&
    css`
      margin-left: 30px;
      position: relative;
      bottom: 15px;
      margin-top: auto;
      top: unset;
    `}
  > div {
      display: flex;
      flex-direction: column;
    }
    > div > div {
      margin-bottom: 15px;
    }
  `}
`;

export const ProposalPageAside = ({
  proposal,
  isAnalysing,
  hasVotableStep,
  isAuthenticated,
  isActualityTab = false,
}: Props) => {
  const { height } = useResize();
  const asideRef = useRef(null);
  const currentVotableStep = proposal?.currentVotableStep;
  const scrollY: number = useScrollYPosition();
  const isDistrictsEnabled = useFeatureFlag('districts');
  const isThemesEnabled = useFeatureFlag('themes');
  const hasVoteBar = hasVotableStep && proposal?.currentVotableStep && isAuthenticated;
  const footerSize = document.getElementsByTagName('footer')[0]?.offsetHeight;
  const bodyHeight = document.getElementsByTagName('body')[0]?.offsetHeight;
  const heightFromTop = hasVoteBar ? HEIGHT_WITH_VOTEBAR : HEIGHT_WITHOUT_VOTEBAR;
  const shouldGoUp = (asideRef?.current?.clientHeight || 0) > height - 30 - heightFromTop;
  const totalHeight = 380 + (asideRef?.current?.clientHeight || 0) - height;
  const bottom = bodyHeight - scrollY - height - footerSize;
  const isMovingUp =
    (shouldGoUp && scrollY > totalHeight && bottom < 0) ||
    (height + bottom - 15 < heightFromTop + (asideRef?.current?.clientHeight || 0) && !shouldGoUp);

  return (
    <Aside
      isAnalysing={isAnalysing}
      hasVoteBar={hasVoteBar}
      isFixedToTop={scrollY > 240 && !shouldGoUp}
      isFixedToBottom={shouldGoUp && scrollY > totalHeight}
      isMovingUp={isMovingUp}
      id="ProposalPageAside">
      <div ref={asideRef}>
        {!isActualityTab && (
          <>
            <ProposalPageMetadata
              proposal={proposal}
              showDistricts={isDistrictsEnabled || false}
              showCategories={proposal?.form?.usingCategories}
              showNullEstimation={
                !!(currentVotableStep && currentVotableStep.voteType === 'BUDGET')
              }
              showThemes={(isThemesEnabled || false) && proposal?.form?.usingThemes}
            />
            <ProposalPageAdvancement proposal={proposal} />
            {currentVotableStep !== null &&
              typeof currentVotableStep !== 'undefined' &&
              currentVotableStep.canDisplayBallot && (
                <ProposalPageVoteThreshold
                  proposal={proposal}
                  step={currentVotableStep}
                  showPoints={(currentVotableStep && currentVotableStep.votesRanking) || false}
                />
              )}
          </>
        )}
        {proposal &&
          (proposal.isProposalUsingAnySocialNetworks ||
            (proposal.form.isUsingAnySocialNetworks &&
              proposal.form.step &&
              proposal.form.step.state === 'CLOSED' &&
              proposal.viewerDidAuthor)) && <ProposalSocialNetworkLinks proposal={proposal} />}
      </div>
    </Aside>
  );
};

export default createFragmentContainer(ProposalPageAside, {
  proposal: graphql`
    fragment ProposalPageAside_proposal on Proposal
    @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
      ...ProposalPageMetadata_proposal
      ...ProposalPageAdvancement_proposal
      ...ProposalPageVoteThreshold_proposal @arguments(stepId: $stepId)
      currentVotableStep {
        votesRanking
        voteType
        canDisplayBallot
        ...ProposalPageVoteThreshold_step
      }
      viewerDidAuthor @include(if: $isAuthenticated)
      isProposalUsingAnySocialNetworks
      ...ProposalSocialNetworkLinks_proposal @arguments(isAuthenticated: $isAuthenticated)
      form {
        step {
          state
        }
        isUsingAnySocialNetworks
        usingCategories
        usingThemes
      }
    }
  `,
});
