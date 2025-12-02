import { Button } from '@cap-collectif/ui'
import { FC } from 'react'
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
        userType: $userType
      )
  }
`

type Props = {
  showMapPlaceholder: boolean
  removePlaceholderAndShowMap: () => void
  step: VoteStepMap_proposalStep$key
}

const backOnCardId = 'cap-back-on-card'

export const VoteStepMap: FC<Props> = ({ showMapPlaceholder, removePlaceholderAndShowMap, step: stepKey }) => {
  const intl = useIntl()
  const step = useFragment(FRAGMENT, stepKey)

  return (
    <>
      <p className="sr-only">{intl.formatMessage({ id: 'helper.bypass-map' })}</p>
      <a href={`#${backOnCardId}`} className="sr-only sr-only-focusable">
        {intl.formatMessage({ id: 'bypass-map' })}
      </a>
      {showMapPlaceholder ? (
        <VoteStepMapPlaceholder>
          <Button variant="secondary" variantSize="big" onClick={removePlaceholderAndShowMap} id={mapId}>
            Afficher la carte
          </Button>
        </VoteStepMapPlaceholder>
      ) : (
        <VoteStepMapContainer step={step} />
      )}
      <a href={`#${mapId}`} id={backOnCardId} className="sr-only sr-only-focusable">
        {intl.formatMessage({ id: 'return-on-map' })}
      </a>
    </>
  )
}
export default VoteStepMap
