import { Button } from '@cap-collectif/ui'
import { FC, useState } from 'react'
import VoteStepMapContainer, { mapId } from './VoteStepMapContainer'
import { graphql, useFragment } from 'react-relay'
import { VoteStepMap_proposalStep$key } from '@relay/VoteStepMap_proposalStep.graphql'
import { useIntl } from 'react-intl'
import VoteStepMapPlaceholder from './VoteStepMapPlaceholder'

const FRAGMENT = graphql`
  fragment VoteStepMap_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    state: { type: "ProposalsState" }
    geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
  ) {
    ...VoteStepMapContainer_proposalStep
      @arguments(
        count: $count
        term: $term
        cursor: $cursor
        category: $category
        district: $district
        orderBy: $orderBy
        geoBoundingBox: $geoBoundingBox
        theme: $theme
        status: $status
        state: $state
        userType: $userType
      )
  }
`

type Props = {
  showMapPlaceholder: boolean
  removePlaceholderAndShowMap: () => void
  step: VoteStepMap_proposalStep$key
  onWorkflowTrigger?: (contributionId: string) => void
}

const backOnCardId = 'back-on-card-anchor'

export const VoteStepMap: FC<Props> = ({
  showMapPlaceholder,
  removePlaceholderAndShowMap,
  step: stepKey,
  onWorkflowTrigger,
}) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)
  const [shouldFocusMap, setShouldFocusMap] = useState(false)

  return (
    <>
      <p className="sr-only">{intl.formatMessage({ id: 'helper.bypass-map' })}</p>
      <a href={`#${backOnCardId}`} className="sr-only sr-only-focusable">
        {intl.formatMessage({ id: 'bypass-map' })}
      </a>
      {showMapPlaceholder ? (
        <VoteStepMapPlaceholder>
          <Button
            variant="secondary"
            variantSize="big"
            onClick={() => {
              setShouldFocusMap(true)
              removePlaceholderAndShowMap()
            }}
            id={mapId}
            // Distinct from the toolbar "Afficher la carte" toggle, and starts with the visible text (WCAG 2.5.3)
            aria-label={intl.formatMessage({ id: 'front.vote-step.map-load' })}
          >
            {intl.formatMessage({ id: 'map.display' })}
          </Button>
        </VoteStepMapPlaceholder>
      ) : (
        <VoteStepMapContainer step={step} onWorkflowTrigger={onWorkflowTrigger} focusOnMount={shouldFocusMap} />
      )}
      <a href={`#${mapId}`} id={backOnCardId} className="sr-only sr-only-focusable">
        {intl.formatMessage({ id: 'return-on-map' })}
      </a>
    </>
  )
}
export default VoteStepMap
