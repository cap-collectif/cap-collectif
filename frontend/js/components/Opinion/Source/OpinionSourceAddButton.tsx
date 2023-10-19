import React from 'react'
import { FormattedMessage } from 'react-intl'
import NewLoginOverlay from '../../Utils/NewLoginOverlay'

type Props = {
  handleClick: () => void
  disabled?: boolean
}

const OpinionSourceAddButton = ({ disabled, handleClick }: Props) => (
  <NewLoginOverlay>
    <button type="button" id="source-form__add" disabled={disabled} className="btn btn-primary" onClick={handleClick}>
      <i className="cap cap-add-1" />
      <FormattedMessage id="opinion.add_new_source" />
    </button>
  </NewLoginOverlay>
)

export default OpinionSourceAddButton
