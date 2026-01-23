import { Box, Button, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import Image from '@shared/ui/Image'
import * as React from 'react'
import { useController } from 'react-hook-form'
import { ButtonChoicesProps } from '../ProposalFormModal.type'

const ButtonChoices: React.FC<ButtonChoicesProps> = ({ name, control, choices }) => {
  const { field } = useController({ name, control })

  const handleSelect = (choiceId: string) => {
    // Toggle selection - if already selected, deselect; otherwise select
    const newValue = field.value === choiceId ? null : choiceId
    field.onChange(newValue)
  }

  const hasImages = choices.some(choice => choice.image?.url)

  // If choices have images, render as image cards
  if (hasImages) {
    return (
      <Flex gap={4} wrap="wrap">
        {choices.map(choice => {
          const isSelected = field.value === choice.id
          const bgColor = choice.color || 'primary.500'

          return (
            <Box
              key={choice.id}
              as="button"
              type="button"
              onClick={() => handleSelect(choice.id)}
              p={2}
              borderRadius="normal"
              border="2px solid"
              borderColor={isSelected ? bgColor : 'gray.200'}
              bg={isSelected ? 'primary.100' : 'white'}
              textAlign="center"
              width="180px"
              style={{ cursor: 'pointer' }}
              _hover={{ borderColor: bgColor }}
            >
              {choice.image?.url ? (
                <Image
                  src={choice.image.url}
                  alt={choice.label}
                  width="100%"
                  height="100px"
                  borderRadius="normal"
                  mb={2}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Box
                  width="100%"
                  height="100px"
                  borderRadius="normal"
                  mb={2}
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon name={CapUIIcon.Picture} color="gray.400" size={CapUIIconSize.Lg} />
                </Box>
              )}
              <Text fontWeight={isSelected ? '600' : '400'}>{choice.label}</Text>
            </Box>
          )
        })}
      </Flex>
    )
  }

  // Default button rendering without images
  return (
    <Flex gap={2} wrap="wrap">
      {choices.map(choice => {
        const isSelected = field.value === choice.id
        const bgColor = choice.color || '#3182CE'

        return (
          <Button
            key={choice.id}
            type="button"
            variant={isSelected ? 'primary' : 'secondary'}
            onClick={() => handleSelect(choice.id)}
            style={{
              backgroundColor: isSelected ? bgColor : 'transparent',
              borderColor: bgColor,
              color: isSelected ? 'white' : bgColor,
            }}
          >
            {choice.label}
          </Button>
        )
      })}
    </Flex>
  )
}

export default ButtonChoices
