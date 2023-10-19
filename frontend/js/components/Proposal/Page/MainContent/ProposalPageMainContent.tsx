import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import type { ProposalPageMainContent_proposal } from '~relay/ProposalPageMainContent_proposal.graphql'
import ProposalPageFusionInformations from './ProposalPageFusionInformations'
import ProposalPageDescription from './ProposalPageDescription'
import ProposalPageLocalisation from './ProposalPageLocalisation'
import ProposalPageNews from './ProposalPageNews'
import ProposalPageDiscussions from './ProposalPageDiscussions'
import ProposalPageOfficialAnswer from './ProposalPageOfficialAnswer'
import ProposalPageCustomSections from './ProposalPageCustomSections'
import ProposalPageMainAside from './ProposalPageMainAside'
import { bootstrapGrid } from '~/utils/sizes'
type Props = {
  readonly proposal: ProposalPageMainContent_proposal | null | undefined
  goToBlog: () => void
  isAnalysing: boolean
}
const ProposalPageMainContentContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  width: 100%;
  min-height: auto;
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
`
export const ProposalPageMainContent = ({ proposal, goToBlog, isAnalysing }: Props) => {
  return (
    <ProposalPageMainContentContainer id={proposal ? 'ProposalPageMainContent' : 'ProposalPageMainContentLoading'}>
      <ProposalPageFusionInformations proposal={proposal} />
      <ProposalPageOfficialAnswer proposal={proposal} />
      <ProposalPageDescription proposal={proposal} />
      <ProposalPageLocalisation proposal={proposal} />
      <ProposalPageCustomSections proposal={proposal} />
      {proposal && <ProposalPageMainAside proposal={proposal} display={isAnalysing} />}
      <ProposalPageNews proposal={proposal} goToBlog={goToBlog} />
      <ProposalPageDiscussions proposal={proposal} />
    </ProposalPageMainContentContainer>
  )
}
export default createFragmentContainer(ProposalPageMainContent, {
  proposal: graphql`
    fragment ProposalPageMainContent_proposal on Proposal @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...ProposalPageFusionInformations_proposal
      ...ProposalPageOfficialAnswer_proposal
      ...ProposalPageDescription_proposal
      ...ProposalPageLocalisation_proposal
      ...ProposalPageCustomSections_proposal
      ...ProposalPageMainAside_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
      ...ProposalPageNews_proposal @arguments(isAuthenticated: $isAuthenticated)
      ...ProposalPageDiscussions_proposal
      ...ProposalVoteButtonWrapperFragment_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
      ...ProposalPageComments_proposal
      ...ProposalReportButton_proposal @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
})
