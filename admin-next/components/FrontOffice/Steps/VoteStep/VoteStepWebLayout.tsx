import { AbstractCard, Box, CapUIIcon, CapUIIconSize, Icon, Flex, Text } from '@cap-collectif/ui'
import ParticipationWorkflow from '@components/ParticipationWorkflow/ParticipationWorkflow'
import { VoteStepWebLayout_proposalStep$key } from '@relay/VoteStepWebLayout_proposalStep.graphql'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useIsMobile from '@shared/hooks/useIsMobile'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import { pxToRem } from '@shared/utils/pxToRem'
import { parseAsInteger, useQueryState } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { evalCustomCode } from 'src/app/custom-code'
import StepLinkedEvents from '../StepLinkedEvents'
import StepVoteMobileActions from './ListActions/VoteStepMobileActions'
import VoteStepMap from './Map/VoteStepMap'
import ProposalDrafts from './ProposalDrafts/ProposalDrafts'
import VoteStepProjectHero from './VoteStepProjectHero'
import VoteStepListHeader from './VoteStepListHeader'
import VoteStepProposalsList from './VoteStepProposalsList'
import VoteStepUserInfos from './VoteStepUserInfos'

type Props = {
  customCode?: string
  projectCustomCode?: string
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
    ... on CollectStep {
      mainView
      mapShownByDefault
    }
    ... on SelectionStep {
      project {
        firstCollectStep {
          mainView
          mapShownByDefault
          form {
            isMapViewEnabled
            isGridViewEnabled
            isListViewEnabled
          }
        }
      }
    }
    ...VoteStepMobileActions_proposalStep
    ...VoteStepUserInfos_proposalStep
    ...ProposalDrafts_step
    ...VoteStepProjectHero_proposalStep
    body
    open
    votable
    project {
      visibility
      adminAlphaUrl
    }
    form {
      id
      objectType
      contribuable
      isMapViewEnabled
      isGridViewEnabled
      isListViewEnabled
    }
  }
`

// Grid columns based on map visibility:
// - Mobile: always 1 column
// - Tablet: 2 columns without map, 1 column with map
// - Desktop: 3 columns without map, 2 columns with map
const getTemplateColumns = (isMapVisible: boolean) => ({
  base: '1fr',
  tablet: isMapVisible ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
  desktop: isMapVisible ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
})

export const VoteStepWebLayout: React.FC<Props> = ({ step: stepKey, customCode, projectCustomCode }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const isMobile = useIsMobile()
  const intl = useIntl()

  const [contributionId, setContributionId] = React.useState(null)
  const [showMapPlaceholder, setShowMapPlaceholder] = React.useState(true)

  const viewStep =
    step.__typename === 'CollectStep'
      ? step
      : step.__typename === 'SelectionStep'
        ? step.project?.firstCollectStep
        : null
  const viewForm = viewStep?.form ?? step.form
  const mapShownByDefault = viewStep?.mapShownByDefault ?? true
  const mapExpandedByDefault = viewStep?.mainView === 'MAP'
  const [mapShown] = useQueryState('map_shown', parseAsInteger)
  const [isMapExpanded] = useQueryState('map_expanded', parseAsInteger.withDefault(mapExpandedByDefault ? 1 : 0))
  const isMapShown =
    mapShown ?? (viewStep?.mainView === 'MAP' ? 1 : mapShownByDefault ? 1 : 0)
  // Mobile: map hidden by default, only shown when map_shown=1 explicitly in URL
  const [mobileMapShown] = useQueryState('map_shown', parseAsInteger)

  if (!step) return null

  const isMapOnlyView =
    isMapShown !== 0 &&
    (isMapExpanded || (viewForm?.isMapViewEnabled && !viewForm?.isGridViewEnabled && !viewForm?.isListViewEnabled))

  const isMobileMapVisible = isMobile && mobileMapShown === 1

  // The size of the filter block, including the padding. Bigger when the vote component is there
  const mapStickyPositionFromTop = step.votable ? 156 : 88
  // We add bottom padding, otherwise the map is fullsize minus its top position
  const mapHeight = `calc(100vh - ${pxToRem(mapStickyPositionFromTop + 24)})`

  React.useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

  React.useEffect(() => {
    evalCustomCode(projectCustomCode)
  }, [projectCustomCode])
  if (contributionId) {
    return <ParticipationWorkflow stepId={step.id} contributionId={contributionId} />
  }

  const triggerRequirementModal = (id: string) => {
    setContributionId(id)
  }

  const triggerProposalWorkflow = (id: string) => {
    setContributionId(id)
  }

  const restrictedAccessAlert =
    step.project?.visibility === 'ME' || step.project?.visibility === 'ADMIN'
      ? intl.formatMessage({
          id: step.project.visibility === 'ME' ? 'global.draft.only_visible_by_you' : 'only-visible-by-administrators',
        })
      : null

  return (
    <Box backgroundColor="neutral-gray.50">
      {restrictedAccessAlert ? (
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          top={0}
          width="100%"
          backgroundColor="#fcf8e3"
          color="#8a6d3b"
          border="1px solid #faebcc"
          px={3}
          py="10px"
          textAlign="center"
          mb={0}
          zIndex={1}
        >
          <Icon name={CapUIIcon.Lock} size={CapUIIconSize.Sm} mr={1} verticalAlign="text-bottom" />
          <Text as="span" color="inherit">
            {restrictedAccessAlert}
          </Text>
          {step.project?.adminAlphaUrl ? (
            <Box
              as="a"
              id="action_show"
              href={step.project.adminAlphaUrl}
              display="inline-flex"
              alignItems="center"
              marginLeft="15px"
              padding="5px 10px"
              backgroundColor="#f0ad4e"
              border="1px solid"
              borderColor="#eea236"
              borderRadius="4px"
              color="white"
              fontSize="12px"
              lineHeight="1.5"
              sx={{
                '&:hover': {
                  backgroundColor: '#ec971f',
                  borderColor: '#d58512',
                  color: 'white',
                  textDecoration: 'none',
                },
              }}
            >
              {intl.formatMessage({ id: 'action_edit' })}
              <Icon name={CapUIIcon.Preview} size={CapUIIconSize.Sm} ml={1} />
            </Box>
          ) : null}
        </Box>
      ) : null}
      <VoteStepProjectHero step={step} />
      <Box maxWidth={pxToRem(1280)} width="100%" margin="auto" py={8} px={[4, 6]}>
        <Flex direction="column" gap="md" mb="xl">
          <StepLinkedEvents step={step} />
          <AbstractCard width="100%" border="none" backgroundColor="white">
            <WYSIWYGRender value={step.body} />
          </AbstractCard>
          <ProposalDrafts step={step} />
        </Flex>
        {!isMobile ? (
          <Box position="sticky" top={0} zIndex={1} backgroundColor="neutral-gray.50" py="lg">
            <VoteStepListHeader step={step} onWorkflowTrigger={triggerProposalWorkflow} />
          </Box>
        ) : step.votable ? (
          <Box flex={`0 1 100%`} position="relative" minHeight={pxToRem(116)} pb={4}>
            <VoteStepUserInfos step={step} />
          </Box>
        ) : null}

        <Box mb="md">
          <Flex justifyContent="space-between" gap="lg">
            {((!isMapExpanded && !isMobile) || isMobile) && !isMapOnlyView ? (
              <Box flex="2 1 0">
                <React.Suspense
                  fallback={
                    <Box width="100%">
                      <ProjectsListPlaceholder
                        count={10}
                        templateColumns={(() => {
                          const cols = getTemplateColumns(viewForm?.isMapViewEnabled && !isMobile && isMapShown !== 0)
                          return [cols.base, cols.tablet, cols.desktop]
                        })()}
                        mt={0}
                      />
                    </Box>
                  }
                >
                  <VoteStepProposalsList
                    step={step}
                    templateColumns={getTemplateColumns(viewForm?.isMapViewEnabled && !isMobile && isMapShown !== 0)}
                    triggerRequirementModal={triggerRequirementModal}
                  />
                </React.Suspense>
              </Box>
            ) : null}
            {viewForm?.isMapViewEnabled && (isMapOnlyView || isMapShown !== 0) && !isMobile ? (
              <Box
                flex={isMapOnlyView ? '1 1 100%' : `0 1 ${pxToRem(395)}`}
                position="sticky"
                top={pxToRem(mapStickyPositionFromTop)}
                height={mapHeight}
              >
                <VoteStepMap
                  step={step}
                  showMapPlaceholder={isMapOnlyView ? false : showMapPlaceholder}
                  removePlaceholderAndShowMap={() => setShowMapPlaceholder(false)}
                  onWorkflowTrigger={triggerProposalWorkflow}
                />
              </Box>
            ) : null}
          </Flex>
        </Box>
        {viewForm?.isMapViewEnabled && (isMapOnlyView || isMobileMapVisible) && isMobile ? (
          <Box position="fixed" top={0} left={0} right={0} bottom="72px" zIndex={1999} backgroundColor="white">
            <VoteStepMap
              step={step}
              showMapPlaceholder={false}
              removePlaceholderAndShowMap={() => {}}
              onWorkflowTrigger={triggerProposalWorkflow}
            />
          </Box>
        ) : null}
      </Box>
      {isMobile && <StepVoteMobileActions step={step} onWorkflowTrigger={triggerProposalWorkflow} />}
    </Box>
  )
}
export default VoteStepWebLayout
