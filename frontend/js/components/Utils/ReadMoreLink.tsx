import React from 'react'
import { FormattedMessage } from 'react-intl'

import styled from 'styled-components'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'

type Props = {
  visible?: boolean
  expanded?: boolean
  onClick: () => void
}
const ReadMoreButton = styled.button`
  text-align: left;
  padding: 0;
  color: ${colors.primaryColor};
  background: none;
  border: none;
  display: flex;
  align-items: center;
  margin-top: 5px;
  outline: 0;
  :hover,
  :active {
    box-shadow: none;
    background: none;
    border: none;
    color: ${colors.primaryColor};
  }

  > span {
    margin-left: 5px;
  }
`

const ReadMoreLink = ({ expanded = false, onClick, visible = false }: Props) => {
  if (!visible) {
    return null
  }

  return (
    <ReadMoreButton onClick={onClick}>
      <>
        <Icon name={expanded ? ICON_NAME.less : ICON_NAME.plus} size={14} color={colors.primaryColor} />
        <FormattedMessage id={expanded ? 'global.less' : 'global.more'} />
      </>
    </ReadMoreButton>
  )
}

ReadMoreLink.displayName = 'ReadMoreLink'
export default ReadMoreLink
