import { AbstractCard, Box, Flex } from '@cap-collectif/ui'
import { VoteStepWebLayout_proposalStep$key } from '@relay/VoteStepWebLayout_proposalStep.graphql'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useIsMobile from '@shared/hooks/useIsMobile'
import { pxToRem } from '@shared/utils/pxToRem'
import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import StepLinkedEvents from '../StepLinkedEvents'
import StepVoteMobileActions from './ListActions/VoteStepMobileActions'
import VoteStepMap from './Map/VoteStepMap'
import VoteStepListHeader from './VoteStepListHeader'
import VoteStepProposalsList from './VoteStepProposalsList'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import { parseAsInteger, useQueryState } from 'nuqs'
import { createPortal } from 'react-dom'
import { Suspense } from 'react'
import ModalSkeleton from '@components/ParticipationWorkflow/ModalSkeleton'
import ParticipationWorkflowModal from '@components/ParticipationWorkflow/ParticipationWorkflowModal'

type Props = {
  step: VoteStepWebLayout_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepWebLayout_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
    isAuthenticated: { type: "Boolean!" }
  ) {
    id
    __typename
    ...VoteStepProposalsList_proposalStep
      @arguments(
        count: $count
        term: $term
        orderBy: $orderBy
        userType: $userType
        theme: $theme
        category: $category
        district: $district
        status: $status
        geoBoundingBox: $geoBoundingBox
        isAuthenticated: $isAuthenticated
      )
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
        geoBoundingBox: $geoBoundingBox
      )
    ...VoteStepListHeader_proposalStep
    ...StepLinkedEvents_step
    id
    ...VoteStepMobileActions_proposalStep
    body
    open
    votable
    form {
      id
      objectType
      contribuable
      isMapViewEnabled
    }
  }
`

// Grid columns based on map visibility:
// - Mobile: always 1 column
// - Tablet: 2 columns without map, 1 column with map
// - Desktop: 3 columns without map, 2 columns with map
const getTemplateColumns = (isMapVisible: boolean) => ({
  base: '1fr',
  tablet: isMapVisible ? '1fr' : 'repeat(2, 1fr)',
  desktop: isMapVisible ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
})

export const VoteStepWebLayout: React.FC<Props> = ({ step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const isMobile = useIsMobile()

  const [showMapPlaceholder, setShowMapPlaceholder] = React.useState(true)

  const [isMapShown] = useQueryState('map_shown', parseAsInteger.withDefault(step.form?.isMapViewEnabled ? 1 : 0))
  const [contributionId, setContributionId] = React.useState(null)
  const [isMapExpanded] = useQueryState('map_expanded', parseAsInteger.withDefault(0))

  // The size of the filter block, including the padding. Bigger when the vote component is there
  const mapStickyPositionFromTop = step.votable ? 156 : 88
  // We add bottom padding, otherwise the map is fullsize minus its top position
  const mapHeight = `calc(100vh - ${pxToRem(mapStickyPositionFromTop + 24)})`

  // TODO : when parcours dépôt is merged replace with <ParticipationWork /> abstraction
  if (contributionId) {
    return createPortal(
      <Box width="100%" height="100vh" position="absolute" top={0} left={0}>
        <Suspense fallback={<ModalSkeleton />}>
          <ParticipationWorkflowModal stepId={step.id} contributionId={contributionId} />
        </Suspense>
      </Box>,
      document.body,
    )
  }

  const triggerRequirementModal = (id: string) => {
    setContributionId(id)
  }

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
        {!isMobile ? (
          <Box position="sticky" top={0} zIndex={1} backgroundColor="neutral-gray.50" py="lg">
            <VoteStepListHeader step={step} />
          </Box>
        ) : step.votable ? (
          <Box position="sticky" top={0} zIndex={1} backgroundColor="neutral-gray.50" py="lg">
            TODO : VOTE COMPONENT
          </Box>
        ) : null}

        <Box mb="md">
          <Flex justifyContent="space-between" gap="lg">
            {(!isMapExpanded && !isMobile) || (isMobile && !isMapShown) ? (
              <Box flex="2 1 0">
                <React.Suspense
                  fallback={
                    <Box width="100%">
                      <ProjectsListPlaceholder
                        count={10}
                        templateColumns={(() => {
                          const cols = getTemplateColumns(!!isMapShown)
                          return [cols.base, cols.tablet, cols.desktop]
                        })()}
                        mt={0}
                      />
                    </Box>
                  }
                >
                  <VoteStepProposalsList
                    step={step}
                    templateColumns={getTemplateColumns(!!isMapShown)}
                    triggerRequirementModal={triggerRequirementModal}
                  />
                </React.Suspense>
              </Box>
            ) : null}
            {step.form?.isMapViewEnabled && isMapShown ? (
              <Box
                flex={`0 1 ${pxToRem(395)}`}
                position="sticky"
                top={pxToRem(mapStickyPositionFromTop)}
                height={mapHeight}
              >
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
      {isMobile && <StepVoteMobileActions step={step} />}
    </Box>
  )
}
export default VoteStepWebLayout
