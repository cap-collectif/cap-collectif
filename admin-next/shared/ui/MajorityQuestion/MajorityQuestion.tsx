import { Box, Flex } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'

export type MajorityOption = {
  id: string
  labelKey: string
  color: string
}

export const MAJORITY_OPTIONS: MajorityOption[] = [
  { id: '0', labelKey: 'very-well', color: '#33691e' },
  { id: '1', labelKey: 'global-well', color: '#43a047' },
  { id: '2', labelKey: 'global-well-enough', color: '#ffc107' },
  { id: '3', labelKey: 'global-passable', color: '#ff9800' },
  { id: '4', labelKey: 'global-not-passable', color: '#b71c1c' },
  { id: '5', labelKey: 'global-reject', color: '#212121' },
]

type MajorityQuestionProps = {
  options?: MajorityOption[]
  selectedValue?: string | null
  onChange?: (value: string) => void
  disabled?: boolean
  asPreview?: boolean
}

const MajorityQuestion: React.FC<MajorityQuestionProps> = ({
  options = MAJORITY_OPTIONS,
  selectedValue = null,
  onChange,
  disabled = false,
  asPreview = false,
}) => {
  const intl = useIntl()

  return (
    <Flex borderRadius="normal" overflow="hidden" width="100%">
      {options.map((option, index) => {
        const isSelected = selectedValue === option.id
        const isFirst = index === 0
        const isLast = index === options.length - 1

        if (asPreview) {
          return (
            <Flex
              key={option.id}
              py={1}
              bg={option.color}
              color="white"
              fontWeight={600}
              fontSize={['caption', 'caption', 'bodySmall']}
              justifyContent="center"
              alignItems="center"
              textAlign="center"
              flex="1"
            >
              {intl.formatMessage({ id: option.labelKey })}
            </Flex>
          )
        }

        return (
          <Box
            key={option.id}
            as="button"
            type="button"
            onClick={() => !disabled && onChange?.(option.id)}
            disabled={disabled}
            flex="1"
            py={3}
            px={2}
            bg={option.color}
            color="white"
            fontWeight="600"
            fontSize="sm"
            textAlign="center"
            borderTopLeftRadius={isFirst ? 'normal' : 0}
            borderBottomLeftRadius={isFirst ? 'normal' : 0}
            borderTopRightRadius={isLast ? 'normal' : 0}
            borderBottomRightRadius={isLast ? 'normal' : 0}
            opacity={disabled ? 0.5 : isSelected ? 1 : 0.7}
            style={{
              outline: isSelected ? '3px solid #3182ce' : 'none',
              outlineOffset: '-3px',
              transition: 'opacity 0.2s',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            _hover={{ opacity: disabled ? 0.5 : 1 }}
          >
            {intl.formatMessage({ id: option.labelKey })}
          </Box>
        )
      })}
    </Flex>
  )
}

export default MajorityQuestion
