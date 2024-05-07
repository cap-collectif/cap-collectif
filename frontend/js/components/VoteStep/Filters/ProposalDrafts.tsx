import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { Box, CapUIRadius, Heading, ListCard } from '@cap-collectif/ui'
import type { ProposalDraftsQuery as ProposalDraftsQueryType } from '~relay/ProposalDraftsQuery.graphql'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import { translateContent } from '~/utils/ContentTranslator'
import { useDisclosure } from '@liinkiing/react-hooks'
import ProposalEditModal from '~/components/Proposal/Edit/ProposalEditModal'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'

type Props = {
  readonly stepId: string
}
const QUERY = graphql`
  query ProposalDraftsQuery($stepId: ID!, $isAuthenticated: Boolean!, $proposalRevisionsEnabled: Boolean!) {
    step: node(id: $stepId) {
      ... on CollectStep {
        url
        viewerProposalDrafts @include(if: $isAuthenticated) {
          edges {
            node {
              ...ProposalEditModal_proposal @arguments(proposalRevisionsEnabled: $proposalRevisionsEnabled)
              title
              url
              slug
              currentVotableStep {
                id
              }
            }
          }
        }
      }
    }
  }
`

const SPACEBAR = 32

const ProposalDrafts = ({ stepId }: Props) => {
  const intl = useIntl()
  const proposalRevisionsEnabled = useFeatureFlag('proposal_revisions')

  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [selectedProposal, setSelectedProposal] = React.useState(null)

  const query = useLazyLoadQuery<ProposalDraftsQueryType>(
    QUERY,
    {
      stepId,
      isAuthenticated,
      proposalRevisionsEnabled: proposalRevisionsEnabled && isAuthenticated,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  )
  if (!query || !isAuthenticated) return null
  const { step } = query

  const proposals = step.viewerProposalDrafts.edges

  if (!proposals.length) return null

  return (
    <>
      {isOpen && <ProposalEditModal proposal={selectedProposal} show={isOpen} onClose={onClose} />}
      <Box width="100%" bg="white" p={6} borderRadius={CapUIRadius.Card} mt={4}>
        <Heading as="h4" fontSize={4} fontWeight={600} mb={4}>
          {intl.formatMessage({ id: 'global.draft.your_draft' })}
        </Heading>
        <ListCard>
          {proposals.map(({ node }, i) => {
            return (
              <ListCard.Item
                as="li"
                key={i}
                sx={{ cursor: 'pointer' }}
                tabIndex={0}
                onKeyUp={e => {
                  if (e.keyCode === SPACEBAR || e.key === ' ') {
                    setSelectedProposal(node)
                    onOpen()
                  }
                }}
                onClick={() => {
                  setSelectedProposal(node)
                  onOpen()
                }}
              >
                <ListCard.Item.Label fontSize={2}>{translateContent(node.title)}</ListCard.Item.Label>
              </ListCard.Item>
            )
          })}
        </ListCard>
      </Box>
    </>
  )
}

export default ProposalDrafts
