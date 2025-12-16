import { AbstractCard, Box, Flex } from '@cap-collectif/ui'
import { VoteStepActionsModal_filters_query$key } from '@relay/VoteStepActionsModal_filters_query.graphql'
import { VoteStepWebLayout_proposalStep$key } from '@relay/VoteStepWebLayout_proposalStep.graphql'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useIsMobile from '@shared/hooks/useIsMobile'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import { pxToRem } from '@shared/utils/pxToRem'
import { parseAsInteger, useQueryState } from 'nuqs'
import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import StepLinkedEvents from '../StepLinkedEvents'
import StepVoteMobileActions from './ListActions/VoteStepMobileActions'
import VoteStepMap from './Map/VoteStepMap'
import VoteStepListHeader from './VoteStepListHeader'
import VoteStepProposalsList from './VoteStepProposalsList'

type Props = {
  step: VoteStepWebLayout_proposalStep$key
  filtersConnection: VoteStepActionsModal_filters_query$key
}

const FRAGMENT = graphql`
  fragment VoteStepWebLayout_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    # cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    # geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
  ) {
    __typename
    ...VoteStepProposalsList_proposalStep @arguments(count: $count, term: $term, orderBy: $orderBy)
    ...VoteStepMap_proposalStep
      @arguments(
        count: $count
        term: $term
        orderBy: $orderBy
        userType: $userType
        theme: $theme
        category: $category
        district: $district
        status: $status
      )
    ...VoteStepListHeader_proposalStep
    ...StepLinkedEvents_step
    body
    open
    votable
    form {
      id
      objectType
      contribuable
      isMapViewEnabled
      ...VoteStepMobileActions_proposalForm_query
    }
  }
`

export const VoteStepWebLayout: React.FC<Props> = ({ step: stepKey, filtersConnection }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const isMobile = useIsMobile()
  const [showMapPlaceholder, setShowMapPlaceholder] = React.useState(true)
  const hasMapView = step.form?.isMapViewEnabled

  const [isMapShown] = useQueryState('map_shown', parseAsInteger)
  const [isMapExpanded] = useQueryState('map_expanded', parseAsInteger)

  const templateColumns = 'repeat(auto-fit, minmax(300px, 2fr))'

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
        {(!isMobile || (isMobile && isMapShown)) && (
          <Box position="sticky" top={0} zIndex={1} backgroundColor="neutral-gray.50" py="lg">
            <VoteStepListHeader step={step} filtersConnection={filtersConnection} />
          </Box>
        )}

        <Box mb="md">
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
      {isMobile && <StepVoteMobileActions form={step.form} />}
    </Box>
  )
}
export default VoteStepWebLayout
