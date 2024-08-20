import React from 'react'

import styled from 'styled-components'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'

const CloseIconContainer = styled.button`
  right: 30px;
  z-index: 1;
  border: none;
  padding: 0;
  background: none;

  &:hover {
    cursor: pointer;
  }
`
export const CloseIcon = ({ onClose }: { onClose: () => void }) => (
  <CloseIconContainer onClick={onClose}>
    <Icon name={ICON_NAME.close} size={16} color={colors.secondaryGray} />
  </CloseIconContainer>
)
