'use client'

import { VoteStepProjectHeroSkeleton, VoteStepWebLayoutSkeleton } from './VoteStepWebLayoutSkeleton'

const VoteStepLoading = () => (
  <>
    <VoteStepProjectHeroSkeleton />
    <VoteStepWebLayoutSkeleton hasMapView={false} />
  </>
)

export default VoteStepLoading
