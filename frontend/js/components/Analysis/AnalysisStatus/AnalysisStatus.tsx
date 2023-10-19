import React from 'react'
import { useIntl } from 'react-intl'
import Label from '~ui/Labels/Label'
import Icon from '~ui/Icons/Icon'
import type { Status } from '~/components/Analysis/AnalysisProposalListRole/AnalysisProposalListRole'

type Props = {
  status: Status
  fontSize?: number
  onClick: () => void
}

const AnalysisStatus = ({ status, onClick, fontSize = 10 }: Props) => {
  const intl = useIntl()
  return (
    <Label color={status.color} fontSize={fontSize} className="analysis-status-container" onClick={onClick}>
      <Icon name={status.icon} size={10} color="#fff" />
      <span className="ml-5">
        {intl.formatMessage({
          id: status.label,
        })}
      </span>
    </Label>
  )
}

export default AnalysisStatus
