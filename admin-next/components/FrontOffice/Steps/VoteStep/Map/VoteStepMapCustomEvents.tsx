'use client'
import { FC, useState } from 'react'
import { Popup, useMapEvents } from 'react-leaflet'
import { graphql, useFragment } from 'react-relay'
import ProposalFormModal from '../ProposalForm/ProposalFormModal'
import { VoteStepMapCustomEvents_proposalStep$key } from '@relay/VoteStepMapCustomEvents_proposalStep.graphql'

interface Props {
  step: VoteStepMapCustomEvents_proposalStep$key
  onWorkflowTrigger?: (contributionId: string) => void
}

const FRAGMENT = graphql`
  fragment VoteStepMapCustomEvents_proposalStep on ProposalStep {
    id
    __typename
    form {
      contribuable
      ...ProposalFormModal_proposalForm
    }
  }
`
const VoteStepMapCustomEvents: FC<Props> = ({ step: stepKey, onWorkflowTrigger }) => {
  const step = useFragment<VoteStepMapCustomEvents_proposalStep$key>(FRAGMENT, stepKey)
  const [position, setPosition] = useState(null)

  const isCollectStep = step.__typename === 'CollectStep'

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  if (!position || !isCollectStep || !step.form) {
    return null
  }

  return (
    <Popup position={position} closeButton={false}>
      <ProposalFormModal
        mode="create"
        disabled={!step.form.contribuable}
        proposalForm={step.form}
        stepId={step.id}
        onWorkflowTrigger={onWorkflowTrigger}
      />
    </Popup>
  )
}
export default VoteStepMapCustomEvents
