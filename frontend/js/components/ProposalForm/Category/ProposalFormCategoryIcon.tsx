import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled, { css } from 'styled-components'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import colors from '~/utils/colors'
import Tooltip from '~ds/Tooltip/Tooltip'
export type Props = {
  onIconClick: (arg0: string | null | undefined) => void
  id: string
  selectedColor: string
  selectedIcon: string | null | undefined
  categoryIcons: ReadonlyArray<{
    readonly name: string
    readonly used: boolean
  }>
}
const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const IconContainer = styled.div<{
  color: string
  isDisabled: boolean
  isSelected: boolean
}>`
  border-radius: 4px;
  height: 29px;
  width: 29px;
  margin-right: 8px;
  outline: none;
  margin-bottom: 8px;
  padding: 4px 8px;
  ${({ isDisabled, color, isSelected }) => css`
    ${!isDisabled &&
    !isSelected &&
    css`
      :hover {
        cursor: pointer;
        svg {
          fill: ${color} !important;
        }
      }
    `}

    ${isSelected &&
    css`
      :hover {
        cursor: pointer;
      }
      background: ${color};
    `}

        ${isDisabled &&
    css`
      svg {
        fill: #ccc !important;
      }
    `}
  `}
`
export const ProposalFormCategoryIcon = ({ id, onIconClick, selectedIcon, categoryIcons, selectedColor }: Props) => {
  const renderIcon = (icon: { readonly name: string; readonly used: boolean }) => {
    const isSelected = selectedIcon === icon.name
    return (
      <IconContainer
        onClick={() => {
          if (!icon.used || isSelected) onIconClick(isSelected ? null : icon.name)
        }}
        color={selectedColor}
        isDisabled={icon.used && icon.name !== selectedIcon}
        isSelected={isSelected}
      >
        <Icon name={ICON_NAME[icon.name]} size={12} color={isSelected ? colors.white : '#001b38'} />
      </IconContainer>
    )
  }

  return (
    <Container id={id}>
      {categoryIcons.map(icon => {
        return !icon.used || icon.name === selectedIcon ? (
          renderIcon(icon)
        ) : (
          <Tooltip
            placement="top"
            label={<FormattedMessage id="already.in.use.feminine" />}
            id={`tooltip-icon-${icon.name}`}
            className="text-left"
            style={{
              wordBreak: 'break-word',
            }}
          >
            {renderIcon(icon)}
          </Tooltip>
        )
      })}
    </Container>
  )
}
export default ProposalFormCategoryIcon
