import React from 'react'
import { FormattedMessage } from 'react-intl'
import Label from '~/components/Ui/Labels/Label'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import styled from 'styled-components'

type Props = {
  color: string
  fontSize: number
  iconSize: number
  iconName: string
  text: string
}

const Status = styled.div`
  .status-label-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }
`

export const ProposalAnalysisStatusLabel = ({ text, color, fontSize, iconSize, iconName }: Props) => (
  <Status>
    <Label color={color} fontSize={fontSize} className={'status-label-container'}>
      <Icon name={ICON_NAME[iconName]} size={iconSize} color={colors.white} />
      <FormattedMessage id={text} />
    </Label>
  </Status>
)
export default ProposalAnalysisStatusLabel
