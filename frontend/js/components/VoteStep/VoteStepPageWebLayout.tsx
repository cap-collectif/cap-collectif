import { Box, Flex } from '@cap-collectif/ui'
import * as React from 'react'
import VoteStepMapQuery from './Map/VoteStepMapQuery'
import ViewChangePanel from './ViewChangePanel'
import ProposalsList from './List/ProposalsList'
import ProposalsListSkeleton from './List/ProposalsListSkeleton'
import VotesList from './List/VotesList'
import VoteStepMapSkeleton from './Map/VoteStepMapSkeleton'
import VoteStepFiltersSkeleton from '~/components/VoteStep/Filters/VoteStepFiltersSkeleton'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import VoteStepFiltersDesktop from '~/components/VoteStep/Filters/VoteStepFiltersDesktop'
import VoteStepPageSearchBar from '~/components/VoteStep/VoteStepPageSearchBar'
import { VoteStepPageWebLayout_query$key } from '~relay/VoteStepPageWebLayout_query.graphql'
import ProposalCreateModal from '~/components/Proposal/Create/ProposalCreateModal'
import { formName } from '~/components/Proposal/Form/ProposalForm'
import VotesInfo from './VotesInfo'
import { View, cardWidthMapView, parseLatLng } from './utils'
import { useWindowWidth } from '~/utils/hooks/useWindowWidth'
import VoteStepPageCollectButton from './VoteStepPageCollectButton'
import { useDisclosure } from '@liinkiing/react-hooks'
import { graphql, useFragment } from 'react-relay'
import { useDispatch } from 'react-redux'
import { reset } from 'redux-form'
import type { Dispatch } from '~/types'

type Props = {
  stepId: string
  isMapView: boolean
  query: VoteStepPageWebLayout_query$key
  disableMapView: boolean
}

const FILTERS_WIDTH = '23.3rem'

const QUERY = graphql`
  fragment VoteStepPageWebLayout_query on Query @argumentDefinitions(stepId: { type: "ID!" }) {
    step: node(id: $stepId) {
      ... on ProposalStep {
        open
        kind
        votable
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

export const VoteStepPageWebLayout = ({ query: queryKey, stepId, isMapView, disableMapView = false }: Props) => {
  const { filters, setFilters, view: contextView, hasMapView } = useVoteStepContext()
  const { latlng } = filters
  const { width } = useWindowWidth()
  const view = contextView || (isMapView ? View.Map : View.List)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const data = useFragment(QUERY, queryKey)
  const dispatch = useDispatch<Dispatch>()
  const { setView } = useVoteStepContext()

  React.useEffect(() => {
    if (disableMapView) {
      setView(View.List)
    }
  }, [setView, disableMapView])

  if (!data || !data.step) return null

  const isCollectStep = data.step.kind === 'collect'

  const isLargeScreen = width >= 1920

  const showImages = view !== View.Map || isLargeScreen

  const isVotable = data.step.votable

  return (
    <>
      {/** @ts-ignore TODO: typescript on redux connect */}
      <ProposalCreateModal
        title="proposal.add"
        proposalForm={data.step.form}
        show={isOpen}
        onClose={onClose}
        onOpen={() => dispatch(reset(formName))}
      />
      <Flex justify="center" maxWidth={'100%'} width="100%">
        <Box width={FILTERS_WIDTH} minWidth={FILTERS_WIDTH} bg="gray.100">
          <React.Suspense fallback={<VoteStepFiltersSkeleton isMobile={false} />}>
            {view === View.Votes ? (
              <Box pr={2}>
                <VotesInfo stepId={stepId} />
              </Box>
            ) : (
              <VoteStepFiltersDesktop stepId={stepId} isCollectStep={isCollectStep} />
            )}
          </React.Suspense>
        </Box>
        <Box
          width={view === View.Map || isLargeScreen ? 'auto' : `calc(100% - ${FILTERS_WIDTH})`}
          bg="gray.100"
          pt={8}
          overflow="hidden"
          sx={{
            '.motion-list': {
              display: view === View.List ? 'block' : 'none !important',
            },
            '.motion-map': {
              display: view === View.Map ? 'block' : 'none !important',
            },
          }}
        >
          <Flex
            alignItems="center"
            width={cardWidthMapView}
            maxWidth={'-webkit-fill-available'}
            gap={4}
            mb={6}
            ml={[0, 2, 6]}
            mr={[1, 4]}
          >
            <Box className="VoteStepPageSearchBar-Container" width="100%" display={'flex'} alignItems="center">
              {data.step.form && isCollectStep && (
                <VoteStepPageCollectButton onOpen={onOpen} disabled={!data.step.form.contribuable} />
              )}
              <VoteStepPageSearchBar />
            </Box>
            <ViewChangePanel
              hideText={width <= 1133 || (view === View.Map && width < 1280)}
              hasMapView={hasMapView}
              hasVotesView={isVotable}
              disableMapView={disableMapView}
            />
          </Flex>

          <React.Suspense fallback={<ProposalsListSkeleton showImages={showImages} />}>
            {view === View.Votes ? (
              <VotesList stepId={stepId} showImages />
            ) : (
              <ProposalsList stepId={stepId} showImages={showImages} />
            )}
          </React.Suspense>
        </Box>
        {hasMapView && (view === View.Map || isLargeScreen) ? (
          <Box
            width={[
              '100%',
              '100%',
              `calc(100% - calc(${FILTERS_WIDTH} + 34.4rem))`,
              `calc(100% - calc(${FILTERS_WIDTH} + 44.4rem))`,
              `calc(100% - calc(${FILTERS_WIDTH} + 53.6rem))`,
              `calc(100% - calc(${FILTERS_WIDTH} + 73rem))`,
            ]}
            pt={8}
          >
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
          </Box>
        ) : null}
      </Flex>
    </>
  )
}
export default VoteStepPageWebLayout
