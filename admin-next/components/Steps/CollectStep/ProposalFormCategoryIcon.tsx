import * as React from 'react'
import styled, { css } from 'styled-components'
import { useIntl } from 'react-intl'
import { CapUIIcon, CapUIIconSize, Flex, Icon, Tooltip } from '@cap-collectif/ui'
import convertIconToDs from '@components/Steps/CollectStep/ProposalFormAdminCategories.utils'

export interface ProposalFormCategoryIconProps {
  onIconClick: (icon: string) => void
  selectedColor?: string
  selectedIcon?: string
  categoryIcons: ReadonlyArray<{
    value: string
    used: boolean
  }>
}

const IconContainer = styled.div`
  border-radius: 4px;
  height: 29px;
  width: 29px;
  margin-right: 8px;
  outline: none;
  margin-bottom: 8px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${
    // @ts-ignore
    ({ isDisabled, color, isSelected }) => css`
      ${!isDisabled &&
      !isSelected &&
      css`
        :hover {
          cursor: pointer;
          svg {
            fill: ${color} !important;
            color: ${color} !important;
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
          color: #ccc !important;
          fill: #ccc !important;
        }
      `}
    `
  }
`
const ProposalFormCategoryIcon: React.FC<ProposalFormCategoryIconProps> = ({
  onIconClick,
  selectedIcon,
  categoryIcons,
  selectedColor,
}) => {
  const intl = useIntl()
  const renderIcon = (icon: { value: string; used: boolean }) => {
    const isSelected = selectedIcon === icon.value
    return (
      <IconContainer
        id={CapUIIcon[convertIconToDs(icon.value)]}
        onClick={() => {
          if (!icon.used || isSelected) onIconClick(isSelected ? null : icon.value)
        }}
        color={selectedColor} // @ts-ignore
        isDisabled={icon.used && icon.value !== selectedIcon}
        isSelected={isSelected}
      >
        {icon.value && (
          <Icon
            name={CapUIIcon[convertIconToDs(icon.value)]}
            size={CapUIIconSize.Lg}
            color={isSelected ? 'white' : '#001b38'}
          />
        )}
      </IconContainer>
    )
  }

  return (
    // todo: refactor me from styled.div to a Flex - see example in ProposalFormCategoryColor
    <Flex flexWrap="wrap">
      {categoryIcons.map(icon => {
        return !icon.used || icon.value === selectedIcon ? (
          renderIcon(icon)
        ) : (
          <Tooltip
            label={intl.formatMessage({ id: 'already.in.use.feminine' })}
            id={`tooltip-icon-${icon.value}`}
            className="text-left"
            style={{ wordBreak: 'break-word' }}
          >
            {renderIcon(icon)}
          </Tooltip>
        )
      })}
    </Flex>
  )
}

export default ProposalFormCategoryIcon
