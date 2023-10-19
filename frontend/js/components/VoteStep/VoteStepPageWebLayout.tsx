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
import VotesInfo from './VotesInfo'
import { View, parseLatLng } from './utils'
type Props = {
  readonly stepId: string
  readonly isMapView: boolean
}
export const VoteStepPageWebLayout = ({ stepId, isMapView }: Props) => {
  const { filters, setFilters, view: contextView } = useVoteStepContext()
  const { latlng } = filters
  const view = contextView || (isMapView ? View.Map : View.List)
  return (
    <Flex>
      <Box width={['30%', '30%', '30%', '20%']} bg="gray.100">
        <React.Suspense fallback={<VoteStepFiltersSkeleton isMobile={false} />}>
          {view === View.Votes ? <VotesInfo stepId={stepId} /> : <VoteStepFiltersDesktop stepId={stepId} />}
        </React.Suspense>
      </Box>
      <Box
        width={view === View.Map ? '40%' : ['70%', '70%', '70%', '80%']}
        bg="gray.100"
        pt={6}
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
          justify="space-between"
          alignItems="center"
          width={view === View.Map ? '100%' : ['100%', '100%', '100%', '50%']}
          px={8}
          mb={6}
          gap={4}
        >
          <Box
            className="VoteStepPageSearchBar-Container"
            width="100%"
            maxWidth={
              view === View.Map
                ? ['100%', 'calc(100% - 11rem)', 'calc(100% - 11rem)', 'calc(100% - 22rem)']
                : 'calc(100% - 22rem)'
            }
          >
            <VoteStepPageSearchBar />
          </Box>
          <ViewChangePanel />
        </Flex>

        <React.Suspense fallback={<ProposalsListSkeleton showImages={view !== View.Map} />}>
          {view === View.Votes ? (
            <VotesList stepId={stepId} showImages />
          ) : (
            <ProposalsList stepId={stepId} showImages={view !== View.Map} />
          )}
        </React.Suspense>
      </Box>
      {view === View.Map ? (
        <Box width={['30%', '30%', '30%', '40%']}>
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
  )
}
export default VoteStepPageWebLayout
