import * as React from 'react'
import styled, { css } from 'styled-components'
import { formatHsl, formatRgb, hexToRgb, rgbToHsl } from '@shared/utils/colors'
import { CapUIIcon, CapUIIconSize, Icon, Tooltip } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

export interface ProposalFormCategoryColorProps {
  onColorClick: (color: string) => void
  selectedColor?: string
  categoryColors: ReadonlyArray<{
    value: string
    used: boolean
  }>
}
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const Color = styled.div`
  border-radius: 4px;
  height: 29px;
  width: 29px;
  background: ${({ color }) => color};
  border: ${({ color }) => `0 solid ${color}`};
  margin-right: 8px;
  outline: none;
  margin-bottom: 8px;
  padding: 4px 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${
    // @ts-ignore
    ({ isDisabled, color, disabledColor }) =>
      isDisabled
        ? css`
            background-color: ${color};
            background: repeating-linear-gradient(
              135deg,
              ${color},
              ${color} 4px,
              ${disabledColor} 0,
              ${disabledColor} 6px
            );
          `
        : css`
            :hover {
              cursor: pointer;
              padding: 6px 10px;
              height: 33px;
              width: 33px;
              margin: -2px 6px 6px -2px;
            }
          `
  }
`
const ProposalFormCategoryColor: React.FC<ProposalFormCategoryColorProps> = ({
  categoryColors,
  selectedColor,
  onColorClick,
}) => {
  const intl = useIntl()
  const renderColor = (color: { value: string; used: boolean }) => {
    const rgb = hexToRgb(color.value)
    const colorRgbFormatted = formatRgb(rgb)
    const { h, s, l } = rgbToHsl(colorRgbFormatted)
    return (
      <Color
        onClick={() => {
          if (!color.used) onColorClick(color.value)
        }}
        color={color.value}
        // @ts-ignore
        isDisabled={color.used && color.value !== selectedColor}
        disabledColor={formatHsl({ h, s, l: l + 10 })}
      >
        {selectedColor === color.value && <Icon name={CapUIIcon.Check} size={CapUIIconSize.Sm} color="white" />}
      </Color>
    )
  }
  return (
    <Container>
      {categoryColors.map(color => {
        return !color.used || color.value === selectedColor ? (
          renderColor(color)
        ) : (
          <Tooltip
            label={intl.formatMessage({ id: 'already.in.use.feminine' })}
            id={`tooltip-color-${color.value}`}
            className="text-left"
            style={{ wordBreak: 'break-word' }}
          >
            {renderColor(color)}
          </Tooltip>
        )
      })}
    </Container>
  )
}

export default ProposalFormCategoryColor
