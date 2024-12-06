import * as React from 'react'
import { formatHsl, formatRgb, hexToRgb, rgbToHsl } from '@shared/utils/colors'
import { CapUIIcon, CapUIIconSize, Flex, Icon, Tooltip } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { pxToRem } from '@shared/utils/pxToRem'

export type ProposalFormCategoryColorProps = {
  isNewCategory: boolean
  categoryColors: ReadonlyArray<CategoryColor>
  selectedColor?: string
  updateCurrentColor: (color: string) => void
}

type CategoryColor = {
  value: string
  used: boolean
}

type ColorProps = {
  color: CategoryColor
  selectedColor: string
  isSelectedColor: boolean
  updateCurrentColor: (color: string) => void
}

const ProposalFormCategoryColor: React.FC<ProposalFormCategoryColorProps> = ({
  isNewCategory,
  categoryColors,
  selectedColor,
  updateCurrentColor,
}) => {
  const intl = useIntl()

  const firstRendered = React.useRef<true | null>(null)

  React.useEffect(() => {
    if (!firstRendered.current) {
      if (isNewCategory) {
        updateCurrentColor(firstAvailableColor.value)
      }
    }
    firstRendered.current = true
  }, [selectedColor, isNewCategory])

  const firstAvailableColor = categoryColors.find(color => !color.used)

  return (
    <Flex wrap="wrap">
      {categoryColors.map(color => {
        return !color.used ? (
          <Color
            key={color.value}
            color={color}
            selectedColor={selectedColor}
            isSelectedColor={color.value === selectedColor}
            updateCurrentColor={updateCurrentColor}
          />
        ) : (
          <Tooltip
            label={intl.formatMessage({ id: 'already.in.use.feminine' })}
            id={`tooltip-color-${color.value}`}
            className="text-left"
            style={{ wordBreak: 'break-word' }}
          >
            <Flex>
              <Color
                color={color}
                selectedColor={selectedColor}
                isSelectedColor={color.value === selectedColor}
                updateCurrentColor={updateCurrentColor}
              />
            </Flex>
          </Tooltip>
        )
      })}
    </Flex>
  )
}

const Color: React.FC<ColorProps> = ({ color, isSelectedColor, updateCurrentColor }) => {
  const rgb = hexToRgb(color.value)
  const colorRgbFormatted = formatRgb(rgb)
  const { h, s, l } = rgbToHsl(colorRgbFormatted)

  return (
    <Flex
      data-color={color.value}
      justifyContent={'center'}
      alignItems={'center'}
      borderRadius={pxToRem(4)}
      height={pxToRem(29)}
      width={pxToRem(29)}
      backgroundColor={color.value}
      border={`0 solid ${color.value}`}
      mr={2}
      mb={2}
      p={[1, 2]}
      sx={{
        backgroundImage: !color.used
          ? color.value
          : `repeating-linear-gradient(
                135deg,
                ${color.value},
                ${color.value} 4px,
                ${formatHsl({ h, s, l: l + 10 })} 0,
                ${formatHsl({ h, s, l: l + 10 })} 6px
              )`,
        outline: 'none',
        '&:hover': !color.used ? { cursor: 'pointer' } : {},
      }}
      onClick={() => {
        if (!color.used) {
          updateCurrentColor(color.value)
        }
      }}
    >
      {isSelectedColor && <Icon name={CapUIIcon.Check} size={CapUIIconSize.Sm} color="white" />}
    </Flex>
  )
}

export default ProposalFormCategoryColor
