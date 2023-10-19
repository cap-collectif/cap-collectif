import * as React from 'react'
import { useFragment, graphql } from 'react-relay'
import { Flex } from '@cap-collectif/ui'
import ProposalAnalysisCommentListItem from '~/components/Proposal/Analysis/ProposalAnalysisCommentListItem'
import type { ProposalAnalysisCommentsList_proposalAnalysis$key } from '~relay/ProposalAnalysisCommentsList_proposalAnalysis.graphql'
import '~relay/ProposalAnalysisCommentsList_proposalAnalysis.graphql'
import type { ProposalAnalysisCommentsList_viewer$key } from '~relay/ProposalAnalysisCommentsList_viewer.graphql'
import '~relay/ProposalAnalysisCommentsList_viewer.graphql'
type Props = {
  readonly proposalAnalysis: ProposalAnalysisCommentsList_proposalAnalysis$key
  readonly viewer: ProposalAnalysisCommentsList_viewer$key
}
const VIEWER_FRAGMENT = graphql`
  fragment ProposalAnalysisCommentsList_viewer on User {
    ...ProposalAnalysisCommentListItem_viewer
  }
`
const PROPOSAL_ANALYSIS_FRAGMENT = graphql`
  fragment ProposalAnalysisCommentsList_proposalAnalysis on ProposalAnalysis {
    comments(first: 50) @connection(key: "ProposalAnalysis_comments") {
      __id
      edges {
        node {
          id
          ...ProposalAnalysisCommentListItem_comment
        }
      }
    }
  }
`

const ProposalAnalysisCommentsList = ({ proposalAnalysis: proposalAnalysisRef, viewer: viewerRef }: Props) => {
  const proposalAnalysis = useFragment(PROPOSAL_ANALYSIS_FRAGMENT, proposalAnalysisRef)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const connectionId = proposalAnalysis?.comments?.__id
  const comments = proposalAnalysis?.comments?.edges?.filter(Boolean)?.map(edge => edge.node) ?? []
  if (comments.length === 0) return null
  return (
    <Flex direction="column" spacing={4}>
      {comments.map(comment => {
        return (
          <ProposalAnalysisCommentListItem
            key={comment.id}
            comment={comment}
            viewer={viewer}
            connectionId={connectionId}
          />
        )
      })}
    </Flex>
  )
}

export default ProposalAnalysisCommentsList
