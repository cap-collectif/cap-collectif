import { Grid } from '@cap-collectif/ui'
import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { VoteStepProposalsList_proposalStep$key } from '@relay/VoteStepProposalsList_proposalStep.graphql'
import ProposalCard from '@components/FrontOffice/ProposalCard/ProposalCard'
import VoteStepEmptyList from './VoteStepEmptyList'
import { useQueryState } from 'nuqs'

type Props = { step: VoteStepProposalsList_proposalStep$key; templateColumns: string }

const PROPOSALS_FRAGMENT = graphql`
  fragment VoteStepProposalsList_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
  )
  @refetchable(queryName: "VoteStepWebLayoutQuery") {
    proposals(
      first: $count
      after: $cursor
      orderBy: $orderBy
      userType: $userType
      theme: $theme
      category: $category
      district: $district
      status: $status
      geoBoundingBox: $geoBoundingBox
      term: $term
    )
      @connection(
        key: "ProposalsList_proposals"
        filters: ["term", "orderBy", "userType", "theme", "category", "district", "status", "geoBoundingBox"]
      ) {
      __id
      edges {
        node {
          id
          ...ProposalCard_proposal
        }
      }
    }
  }
`

export const VoteStepProposalsList: React.FC<Props> = ({ step: stepKey, templateColumns }) => {
  const { data } = usePaginationFragment(PROPOSALS_FRAGMENT, stepKey)
  const proposalsLength = data?.proposals?.edges?.length
  const [listView] = useQueryState('list_view', { defaultValue: 'grid' })

  return proposalsLength ? (
    <Grid templateColumns={listView === 'grid' ? ['1fr', templateColumns] : '1fr'} gap="lg">
      {data.proposals.edges.map(({ node }) => (
        <ProposalCard key={node.id} proposal={node} />
      ))}
    </Grid>
  ) : (
    <VoteStepEmptyList />
  )
}
export default VoteStepProposalsList
