import { Box, Flex } from '@cap-collectif/ui'
import * as React from 'react'
import VoteStepMapQuery from './Map/VoteStepMapQuery'
import ViewChangePanel from './ViewChangePanel'
import ProposalsList from './List/ProposalsList'
import ProposalsListSkeleton from './List/ProposalsListSkeleton'
import VoteStepMapSkeleton from './Map/VoteStepMapSkeleton'
import VotesList from './List/VotesList'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import VoteStepPageSearchBarMobile from '~/components/VoteStep/VoteStepPageSearchBarMobile'
import VoteStepFiltersMobile from '~/components/VoteStep/Filters/VoteStepFiltersMobile'
import VoteStepFiltersSkeleton from '~/components/VoteStep/Filters/VoteStepFiltersSkeleton'
import { View, parseLatLng } from './utils'
import VoteInfoPanel from './Filters/VoteInfoPanel/VoteInfoPanel'
import VoteStepPageCollectButton from './VoteStepPageCollectButton'
import { graphql, useFragment } from 'react-relay'
import { VoteStepPageMobileLayout_query$key } from '~relay/VoteStepPageMobileLayout_query.graphql'
import { useDisclosure } from '@liinkiing/react-hooks'
import ProposalCreateModal from '../Proposal/Create/ProposalCreateModal'
import { useDispatch } from 'react-redux'
import { Dispatch } from '~/types'
import { formName } from '~/components/Proposal/Form/ProposalForm'
import { reset } from 'redux-form'
import VoteStepPageAnonymousToggle from './VoteStepPageAnonymousToggle'
import VoteStepPageDescription from './VoteStepPageDescription'
import ProposalDrafts from './Filters/ProposalDrafts'

type Props = {
  stepId: string
  isMapView: boolean
  query: VoteStepPageMobileLayout_query$key
}

const QUERY = graphql`
  fragment VoteStepPageMobileLayout_query on Query @argumentDefinitions(stepId: { type: "ID!" }) {
    step: node(id: $stepId) {
      ... on ProposalStep {
        open
        kind
        votable
        title
        timeRange {
          startAt
          endAt
        }
        body
        isProposalSmsVoteEnabled
        form {
          id
          objectType
          contribuable
          ...ProposalCreateModal_proposalForm
        }
      }
    }
  }
`

export const VoteStepPageMobileLayout = ({ query: queryKey, stepId, isMapView }: Props) => {
  const [showFiltersPage, setShowFiltersPage] = React.useState<boolean>(false)
  const { filters, setFilters, view: contextView, hasMapView } = useVoteStepContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const data = useFragment(QUERY, queryKey)
  const { latlng } = filters
  const view = contextView || (isMapView ? View.Map : View.List)
  const dispatch = useDispatch<Dispatch>()

  const isCollectStep = data.step.kind === 'collect'

  const isVotable = data.step.votable

  if (showFiltersPage) {
    const closeFilterPage = () => setShowFiltersPage(false)

    return (
      <React.Suspense fallback={<VoteStepFiltersSkeleton isMobile />}>
        <VoteStepFiltersMobile stepId={stepId} onClose={closeFilterPage} />
      </React.Suspense>
    )
  }

  return (
    <>
      {/** @ts-ignore TODO: typescript on redux connect */}
      <ProposalCreateModal
        title="proposal.add"
        proposalForm={data.step.form}
        show={isOpen}
        onClose={onClose}
        onOpen={() => dispatch(reset(formName))}
        fullSizeOnMobile
      />
      <Flex direction="column" width="100%">
        <Flex
          justifyContent="space-between"
          width="100%"
          bg={view === View.Map ? 'unset' : 'neutral-gray.100'}
          position={view === View.Map ? 'absolute' : 'sticky'}
          top={view === View.Map ? 'unset' : '50px'}
          pt={6}
          pb={view === View.Map ? 0 : 6}
          left={0}
          px={4}
          gap={4}
          zIndex={99}
        >
          <VoteStepPageSearchBarMobile onClick={() => setShowFiltersPage(true)} />
          <ViewChangePanel
            hideText
            hasMapView={hasMapView}
            hasVotesView={isVotable}
            isProposalSmsVoteEnabled={data.step.isProposalSmsVoteEnabled}
          />
        </Flex>
        {view === View.Map ? (
          <React.Suspense fallback={<VoteStepMapSkeleton />}>
            <VoteStepMapQuery
              stepId={stepId}
              handleMapPositionChange={(newLatlngBounds: string) => {
                setFilters('latlng', '')
                setFilters('latlngBounds', newLatlngBounds)
              }}
              urlCenter={latlng ? parseLatLng(latlng) : null}
            />
          </React.Suspense>
        ) : (
          <React.Suspense fallback={<ProposalsListSkeleton />}>
            <Box pb={6} mx={4}>
              <VoteStepPageDescription
                title={data.step.title}
                body={data.step.body as string}
                timeRange={data.step.timeRange}
              />
              {isCollectStep ? <ProposalDrafts stepId={stepId} /> : null}
            </Box>
            <VoteInfoPanel stepId={stepId} isMobile />
            <Box width="100%">
              {view === View.Votes ? (
                <>
                  <VoteStepPageAnonymousToggle stepId={stepId} />
                  <VotesList stepId={stepId} showImages={false} />
                </>
              ) : (
                <ProposalsList stepId={stepId} showImages={false} />
              )}
            </Box>
            {data.step.form && isCollectStep && (
              <VoteStepPageCollectButton onOpen={onOpen} disabled={!data.step.form.contribuable} />
            )}
          </React.Suspense>
        )}
      </Flex>
    </>
  )
}
export default VoteStepPageMobileLayout
