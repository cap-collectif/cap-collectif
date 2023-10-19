import * as React from 'react'
import { Box, Flex, Text } from '@cap-collectif/ui'
import { useFragment, graphql } from 'react-relay'
import { useIntl } from 'react-intl'
import ProposalAnalysisCommentsList from '~/components/Proposal/Analysis/ProposalAnalysisCommentsList'
import ProposalAnalysisCommentCreateForm from '~/components/Proposal/Analysis/ProposalAnalysisCommentCreateForm'
import type { ProposalAnalysisComments_viewer$key } from '~relay/ProposalAnalysisComments_viewer.graphql'
import '~relay/ProposalAnalysisComments_viewer.graphql'
import type { ProposalAnalysisComments_proposalAnalysis$key } from '~relay/ProposalAnalysisComments_proposalAnalysis.graphql'
import '~relay/ProposalAnalysisComments_proposalAnalysis.graphql'
type Props = {
  readonly proposalAnalysis: ProposalAnalysisComments_proposalAnalysis$key
  readonly viewer: ProposalAnalysisComments_viewer$key
}
const VIEWER_FRAGMENT = graphql`
  fragment ProposalAnalysisComments_viewer on User {
    id
    ...ProposalAnalysisCommentCreateForm_viewer
    ...ProposalAnalysisCommentsList_viewer
  }
`
const PROPOSAL_ANALYSIS_FRAGMENT = graphql`
  fragment ProposalAnalysisComments_proposalAnalysis on ProposalAnalysis {
    concernedUsers {
      id
    }
    ...ProposalAnalysisCommentCreateForm_proposalAnalysis
    ...ProposalAnalysisCommentsList_proposalAnalysis
  }
`

const ProposalAnalysisComments = ({ proposalAnalysis: proposalAnalysisRef, viewer: viewerRef }: Props) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const proposalAnalysis = useFragment(PROPOSAL_ANALYSIS_FRAGMENT, proposalAnalysisRef)
  const intl = useIntl()
  const canComment = proposalAnalysis?.concernedUsers?.some(user => user.id === viewer.id) ?? false
  return (
    <Flex direction="column" backgroundColor="#F4F4F4" p={4}>
      <Box mb={4}>
        <Text color="neutral-gray.900" fontSize={3} fontWeight={600}>
          {intl.formatMessage({
            id: 'admin.label.comment',
          })}
        </Text>
        <Text color="neutral-gray.700" fontSize={2}>
          {intl.formatMessage({
            id: 'space-for-the-analyst-supervisor-decision-maker',
          })}
        </Text>
      </Box>
      {canComment && <ProposalAnalysisCommentCreateForm viewer={viewer} proposalAnalysis={proposalAnalysis} />}
      <ProposalAnalysisCommentsList proposalAnalysis={proposalAnalysis} viewer={viewer} />
    </Flex>
  )
}

export default ProposalAnalysisComments
