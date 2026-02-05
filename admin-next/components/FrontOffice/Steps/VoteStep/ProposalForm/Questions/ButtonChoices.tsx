import { Box, CapUIFontWeight, Flex } from '@cap-collectif/ui'
import * as React from 'react'
import { useController } from 'react-hook-form'
import { ButtonChoicesProps } from '../ProposalFormModal.type'

type ButtonStylesParams = {
  isSelected: boolean
  hasColor: boolean
  color: string | null
  showDisabledStyle?: boolean
}

const getButtonStyles = ({ isSelected, hasColor, color, showDisabledStyle = false }: ButtonStylesParams) => {
  // No color: black border, white bg (unselected) / black bg + white text (selected)
  // With color: use the color for border and bg when selected
  const activeColor = hasColor ? color : 'black'

  if (showDisabledStyle) {
    return { backgroundColor: 'gray.200', borderColor: 'gray.200', textColor: 'gray.800' }
  }

  return {
    backgroundColor: isSelected ? activeColor : 'white',
    borderColor: activeColor,
    textColor: isSelected ? 'white' : activeColor,
  }
}

const ButtonChoices: React.FC<ButtonChoicesProps> = ({
  name,
  control,
  choices,
  groupedResponsesEnabled = false,
  responseColorsDisabled = false,
}) => {
  const { field } = useController({ name, control })

  const handleSelect = (choiceId: string) => {
    const newValue = field.value === choiceId ? null : choiceId
    field.onChange(newValue)
  }

  const hasSelection = !!field.value

  return (
    <Flex gap={groupedResponsesEnabled ? 0 : 2} wrap="wrap">
      {choices.map((choice, index) => {
        const isSelected = field.value === choice.id
        const hasColor = !!choice.color && !responseColorsDisabled
        const showDisabledStyle = groupedResponsesEnabled && hasSelection && !isSelected

        const { backgroundColor, borderColor, textColor } = getButtonStyles({
          isSelected,
          hasColor,
          color: choice.color,
          showDisabledStyle,
        })

        const isFirst = index === 0
        const isLast = index === choices.length - 1

        return (
          <Box
            key={choice.id}
            as="button"
            type="button"
            onClick={() => handleSelect(choice.id)}
            px={4}
            py={2}
            bg={backgroundColor}
            border="1px solid"
            borderColor={borderColor}
            color={textColor}
            fontWeight={CapUIFontWeight.Semibold}
            borderRadius={groupedResponsesEnabled ? 0 : 'button'}
            borderTopLeftRadius={groupedResponsesEnabled && isFirst ? '4px' : undefined}
            borderBottomLeftRadius={groupedResponsesEnabled && isFirst ? '4px' : undefined}
            borderTopRightRadius={groupedResponsesEnabled && isLast ? '4px' : undefined}
            borderBottomRightRadius={groupedResponsesEnabled && isLast ? '4px' : undefined}
            marginLeft={groupedResponsesEnabled && !isFirst ? '-1px' : undefined}
            style={{ cursor: 'pointer' }}
          >
            {choice.label}
          </Box>
        )
      })}
    </Flex>
  )
}

export default ButtonChoices
