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
type Props = {
  readonly stepId: string
  readonly isMapView: boolean
}
const BACKGROUND_COLOR = '#F7FAFB'
export const VoteStepPageMobileLayout = ({ stepId, isMapView }: Props) => {
  const [showFiltersPage, setShowFiltersPage] = React.useState<boolean>(false)
  const { filters, setFilters, view: contextView } = useVoteStepContext()
  const { latlng } = filters
  const view = contextView || (isMapView ? View.Map : View.List)

  if (showFiltersPage) {
    const closeFilterPage = () => setShowFiltersPage(false)

    return (
      <React.Suspense fallback={<VoteStepFiltersSkeleton isMobile />}>
        <VoteStepFiltersMobile stepId={stepId} onClose={closeFilterPage} />
      </React.Suspense>
    )
  }

  return (
    <Flex direction="column">
      <Flex
        sx={{
          background: view === View.Map ? 'none' : BACKGROUND_COLOR,
        }}
        justifyContent="space-between"
        width="100%"
        position="absolute"
        pt={6}
        pb={view === View.Map ? 0 : 6}
        left={0}
        px={4}
        gap={4}
        zIndex={99}
      >
        <VoteStepPageSearchBarMobile onClick={() => setShowFiltersPage(true)} />
        <ViewChangePanel isMobile />
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
        <Box bg={BACKGROUND_COLOR} width="100%" height="100vh">
          <React.Suspense fallback={<ProposalsListSkeleton />}>
            {view === View.Votes ? (
              <VotesList stepId={stepId} showImages={false} />
            ) : (
              <ProposalsList stepId={stepId} showImages={false} />
            )}
          </React.Suspense>
        </Box>
      )}
    </Flex>
  )
}
export default VoteStepPageMobileLayout
