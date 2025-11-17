import * as React from 'react'
import { Button, CapUIIcon } from '@cap-collectif/ui'
import { LatLng } from 'leaflet'

type Props = { disabled: boolean; initialPosition?: LatLng }

const ProposalForm: React.FC<Props> = ({ disabled }) => {
  return (
    <Button
      disabled={disabled}
      flex="none"
      variant="primary"
      leftIcon={CapUIIcon.Add}
      onClick={() =>
        alert("TODO : Le formulaire de dépot sous react-hook-form. Vous avez pas cru j'allais tout faire ptdr")
      }
    >
      Déposer une ENTITÉ
    </Button>
  )
}

export default ProposalForm
