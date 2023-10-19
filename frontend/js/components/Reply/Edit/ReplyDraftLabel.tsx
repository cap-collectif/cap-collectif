import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Label } from 'react-bootstrap'

type Props = {
  draft: boolean
}

const ReplyDraftLabel = ({ draft }: Props) =>
  draft ? (
    <Label className="badge-pill ml-5" bsStyle="default">
      <FormattedMessage id="proposal.state.draft" />
    </Label>
  ) : null

export default ReplyDraftLabel
