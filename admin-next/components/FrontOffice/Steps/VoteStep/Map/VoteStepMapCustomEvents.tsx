'use client'
import { FC, useState } from 'react'
import { Popup, useMapEvents } from 'react-leaflet'
import { graphql, useFragment } from 'react-relay'
import ProposalForm from '../ProposalForm/ProposalForm'
import { VoteStepMapCustomEvents_proposalStep$key } from '@relay/VoteStepMapCustomEvents_proposalStep.graphql'

interface Props {
  step: VoteStepMapCustomEvents_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepMapCustomEvents_proposalStep on ProposalStep {
    __typename
    form {
      contribuable
    }
  }
`
const VoteStepMapCustomEvents: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment<VoteStepMapCustomEvents_proposalStep$key>(FRAGMENT, stepKey)
  const [position, setPosition] = useState(null)

  const isCollectStep = step.__typename === 'CollectStep'

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position && isCollectStep ? (
    <Popup position={position}>
      <ProposalForm disabled={!step.form.contribuable} initialPosition={position} />
    </Popup>
  ) : null
}
export default VoteStepMapCustomEvents
