import { Box, CapUIFontSize, CapUIRadius, Heading, ListCard } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { ProposalDraftsQuery as ProposalDraftsQueryType } from '@relay/ProposalDraftsQuery.graphql'
import { ProposalDrafts_step$data, ProposalDrafts_step$key } from '@relay/ProposalDrafts_step.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import ProposalFormModal from '../ProposalForm/ProposalFormModal'

type Props = {
  step: ProposalDrafts_step$key
}

const FRAGMENT = graphql`
  fragment ProposalDrafts_step on ProposalStep {
    id
    __typename
    form {
      id
      ...ProposalFormModal_proposalForm
    }
  }
`

const QUERY = graphql`
  query ProposalDraftsQuery($stepId: ID!, $isAuthenticated: Boolean!) {
    step: node(id: $stepId) {
      ... on CollectStep {
        viewerProposalDrafts @include(if: $isAuthenticated) {
          edges {
            node {
              id
              title
              ...ProposalFormModal_proposal
            }
          }
        }
      }
    }
  }
`

type ProposalDraftsListProps = {
  stepId: string
  isAuthenticated: boolean
  proposalForm: NonNullable<ProposalDrafts_step$data['form']>
}

const ProposalDraftsList: React.FC<ProposalDraftsListProps> = ({ stepId, isAuthenticated, proposalForm }) => {
  const intl = useIntl()
  const [selectedProposal, setSelectedProposal] = React.useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)

  const data = useLazyLoadQuery<ProposalDraftsQueryType>(
    QUERY,
    {
      stepId,
      isAuthenticated,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  )

  if (!data?.step || !isAuthenticated) return null

  const drafts = data.step.viewerProposalDrafts?.edges || []

  if (drafts.length === 0) return null

  return (
    <>
      <Box width="100%" bg="white" p={6} borderRadius={CapUIRadius.Card}>
        <Heading as="h4" fontSize={CapUIFontSize.Headline} fontWeight={600} mb={4}>
          {intl.formatMessage({ id: 'global.draft.your_draft' })}
        </Heading>
        <ListCard>
          {drafts.map(edge => {
            if (!edge?.node) return null
            const draft = edge.node
            return (
              <ListCard.Item
                as="li"
                key={draft.id}
                sx={{ cursor: 'pointer' }}
                tabIndex={0}
                onKeyUp={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    setSelectedProposal(draft)
                    setIsEditModalOpen(true)
                  }
                }}
                onClick={() => {
                  setSelectedProposal(draft)
                  setIsEditModalOpen(true)
                }}
              >
                <ListCard.Item.Label fontSize={CapUIFontSize.BodySmall}>{draft.title}</ListCard.Item.Label>
              </ListCard.Item>
            )
          })}
        </ListCard>
      </Box>

      {isEditModalOpen && selectedProposal && (
        <ProposalFormModal
          mode="edit"
          proposal={selectedProposal}
          proposalForm={proposalForm}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProposal(null)
          }}
        />
      )}
    </>
  )
}

const ProposalDrafts: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const { viewerSession } = useAppContext()
  const isAuthenticated = viewerSession !== null

  // Only CollectStep has viewerProposalDrafts
  if (step.__typename !== 'CollectStep') return null
  if (!step.form) return null

  return (
    <React.Suspense fallback={null}>
      <ProposalDraftsList stepId={step.id} isAuthenticated={isAuthenticated} proposalForm={step.form} />
    </React.Suspense>
  )
}

export default ProposalDrafts
