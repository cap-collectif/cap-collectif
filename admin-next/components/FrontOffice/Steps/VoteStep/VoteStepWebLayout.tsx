import { AbstractCard, Box, Flex } from '@cap-collectif/ui'
import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { VoteStepWebLayout_proposalStep$key } from '@relay/VoteStepWebLayout_proposalStep.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import StepLinkedEvents from '../StepLinkedEvents'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import VoteStepFiltersWeb from './Filters/VoteStepFiltersWeb'
import VoteStepProposalsList from './VoteStepProposalsList'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import VoteStepMap from './Map/VoteStepMap'
import { parseAsInteger, useQueryState } from 'nuqs'

type Props = {
  step: VoteStepWebLayout_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepWebLayout_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    # cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    # userType: { type: "ID" }
    # theme: { type: "ID" }
    # category: { type: "ID" }
    # district: { type: "ID" }
    # status: { type: "ID" }
    # geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
  ) {
    __typename
    ...VoteStepProposalsList_proposalStep @arguments(count: $count, term: $term, orderBy: $orderBy)
    ...VoteStepMap_proposalStep @arguments(count: $count, term: $term, orderBy: $orderBy)
    ...VoteStepFiltersWeb_proposalStep
    ...StepLinkedEvents_step
    body
    open
    votable
    form {
      id
      objectType
      contribuable
      isMapViewEnabled
      # ...ProposalCreateModal_proposalForm
    }
  }
`

export const VoteStepWebLayout: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const [showMapPlaceholder, setShowMapPlaceholder] = React.useState(true)
  const hasMapView = step.form?.isMapViewEnabled

  const [isMapShown] = useQueryState('map_shown', parseAsInteger)
  const [isMapExpanded] = useQueryState('map_expanded', parseAsInteger)

  const templateColumns = 'repeat(auto-fit, minmax(300px, 1fr))'

  // The size of the filter block, including the padding. Bigger when the vote component is there
  const mapStickyPositionFromTop = step.votable ? 156 : 88
  // We add bottom padding, otherwise the map is fullsize minus its top position
  const mapHeight = `calc(100vh - ${pxToRem(mapStickyPositionFromTop + 24)})`

  return (
    <Box backgroundColor="neutral-gray.50">
      <Box maxWidth={pxToRem(1280)} width="100%" margin="auto" py={8} px={[4, 6]}>
        <Flex direction="column" gap="xxl" mb="xl">
          <StepLinkedEvents step={step} />
          <AbstractCard width="100%" border="none" backgroundColor="white">
            <WYSIWYGRender value={step.body} />
          </AbstractCard>
          ---- Les brouillons ----
        </Flex>
        <Box position="sticky" top={0} zIndex={1} backgroundColor="neutral-gray.50" py="lg">
          <VoteStepFiltersWeb step={step} />
        </Box>
        <Box>
          <Flex justifyContent="space-between" gap="lg">
            {!isMapExpanded ? (
              <Box flex="2 1 0">
                <React.Suspense
                  fallback={
                    <Box width="100%">
                      <ProjectsListPlaceholder count={10} templateColumns={templateColumns} mt={0} />
                    </Box>
                  }
                >
                  <VoteStepProposalsList step={step} templateColumns={templateColumns} />
                </React.Suspense>
              </Box>
            ) : null}
            {hasMapView && isMapShown ? (
              <Box flex="1 1 0" position="sticky" top={pxToRem(mapStickyPositionFromTop)} height={mapHeight}>
                <VoteStepMap
                  step={step}
                  showMapPlaceholder={showMapPlaceholder}
                  removePlaceholderAndShowMap={() => setShowMapPlaceholder(false)}
                />
              </Box>
            ) : null}
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
export default VoteStepWebLayout
