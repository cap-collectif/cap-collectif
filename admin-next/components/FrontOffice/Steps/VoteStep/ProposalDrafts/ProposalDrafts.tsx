import {
  Button,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Card,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  Divider,
  Flex,
  Icon,
  Text,
} from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { ProposalDraftsQuery as ProposalDraftsQueryType } from '@relay/ProposalDraftsQuery.graphql'
import { ProposalDrafts_step$data, ProposalDrafts_step$key } from '@relay/ProposalDrafts_step.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
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
    timeRange {
      isOpen
    }
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
              media {
                url
              }
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
      <Flex alignItems="center" lineHeight={CapUILineHeight.Normal} gap={2}>
        <Icon name={CapUIIcon.Lock} size={CapUIIconSize.Sm} lineHeight={CapUILineHeight.Normal} alignSelf="center" />
        <Text as="h4" fontSize={CapUIFontSize.BodyRegular} fontWeight={600} lineHeight={CapUILineHeight.Normal}>
          {intl.formatMessage({ id: 'front.proposal.your-drafts' })}
        </Text>
        <Text fontSize={CapUIFontSize.BodySmall} color="text.secondary" lineHeight={CapUILineHeight.Normal}>
          {intl.formatMessage({ id: 'global.draft.only_visible_by_you' })}
        </Text>
        <Divider flex={1}> </Divider>
      </Flex>
      {drafts.map(edge => {
        if (!edge?.node) return null
        const draft = edge.node
        return (
          <Card
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
            display="flex"
            // @ts-ignore
            flexDirection="row"
            gap="md"
            // todo: card format horizontal size S after UI 6.0.10 release
          >
            <CardCover width={pxToRem(100)} height={pxToRem(66)}>
              {draft.media?.url ? (
                <CardCoverImage src={draft.media.url} />
              ) : (
                // todo: update when DS 6.0.10 is merged to match design
                <CardCoverPlaceholder icon={CapUIIcon.PictureO} color="neutral-gray.lighter" />
              )}
            </CardCover>
            <Flex direction="column">
              <Text
                fontSize={CapUIFontSize.BodyRegular}
                fontWeight={CapUIFontWeight.Semibold}
                lineHeight={CapUILineHeight.M}
              >
                {draft.title}
              </Text>
              <Button
                variant="link"
                color="text.secondary"
                p={0}
                fontSize={CapUIFontSize.BodyRegular}
                fontWeight={CapUIFontWeight.Normal}
                lineHeight={CapUILineHeight.M}
                onClick={() => {
                  setSelectedProposal(draft)
                  setIsEditModalOpen(true)
                }}
              >
                {intl.formatMessage({ id: 'front.proposal.keep-editing' })}
              </Button>
            </Flex>
          </Card>
        )
      })}

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
  // Don't display drafts section when step is closed
  if (!step.timeRange.isOpen) return null

  return (
    <React.Suspense fallback={null}>
      <ProposalDraftsList stepId={step.id} isAuthenticated={isAuthenticated} proposalForm={step.form} />
    </React.Suspense>
  )
}

export default ProposalDrafts
