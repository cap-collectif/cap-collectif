import { FieldInput } from '@cap-collectif/form'
import { Box, Checkbox, Flex, Radio, Text } from '@cap-collectif/ui'
import Image from '@shared/ui/Image'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import * as React from 'react'
import { useController } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { MultipleChoiceChoice, MultipleChoiceQuestionProps } from '../ProposalFormModal.type'

/**
 * Radio and Checkbox questions
 */
const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  name,
  control,
  choices,
  isOtherAllowed,
  isMultiple = false,
}) => {
  const { field } = useController({ name, control })
  const otherValueField = useController({ name: `${name}-other-value`, control })
  const groupHasImages = choices.some(choice => choice.image?.url)
  const intl = useIntl()

  const selectedIds: string[] = isMultiple ? (Array.isArray(field.value) ? field.value : []) : []

  const isSelected = (choiceId: string) => (isMultiple ? selectedIds.includes(choiceId) : field.value === choiceId)

  const handleSelect = (choiceId: string, checked?: boolean) => {
    if (isMultiple) {
      const newValue = checked ? [...selectedIds, choiceId] : selectedIds.filter(id => id !== choiceId)
      field.onChange(newValue)
    } else {
      field.onChange(choiceId)
    }
    if (choiceId === 'other' && (isMultiple ? checked : true)) {
      otherValueField.field.onChange('')
    }
  }

  const allChoices: (MultipleChoiceChoice & { isOther?: boolean })[] = [
    ...choices,
    ...(isOtherAllowed
      ? [
          {
            id: 'other',
            label: intl.formatMessage({ id: 'gender.other' }),
            isOther: true,
            description: null,
            image: null,
          },
        ]
      : []),
  ]

  const ChoiceGroupQuestion = isMultiple ? Checkbox : Radio

  return (
    <Flex direction="column" gap={groupHasImages ? 4 : 1}>
      {allChoices.map(choice => {
        const selected = isSelected(choice.id)
        const isOther = 'isOther' in choice && choice.isOther
        const optionHasImage = !!choice.image?.url

        return (
          <Flex
            key={choice.id}
            direction="column"
            alignItems={optionHasImage ? 'center' : 'flex-start'}
            gap={2}
            border={optionHasImage ? '1px solid' : 'none'}
            borderColor={optionHasImage ? (selected ? 'primary.500' : 'gray.300') : 'unset'}
            p={optionHasImage ? 3 : 0}
            borderRadius="normal"
            width={optionHasImage ? '70%' : '100%'}
            mx={optionHasImage ? 'auto' : 0}
          >
            {groupHasImages && optionHasImage && (
              <Box width="100%" mb={2}>
                <Image
                  src={choice?.image?.url}
                  alt={choice.label}
                  maxWidth="100%"
                  maxHeight="300px"
                  mx="auto"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            )}
            <Flex align="center" gap={2}>
              <ChoiceGroupQuestion
                id={isOther ? `${name}-other` : `${name}-${choice.id}`}
                name={name}
                checked={selected}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelect(choice.id, isMultiple ? e.target.checked : undefined)
                }
                width={optionHasImage ? '70%' : '100%'}
                mx={groupHasImages ? 'auto' : 0}
              >
                {choice.label}
              </ChoiceGroupQuestion>
              {isOther && (
                <FieldInput
                  type="text"
                  id={`${name}-other-value`}
                  name={`${name}-other-value`}
                  control={control}
                  disabled={!selected}
                />
              )}
            </Flex>
            {choice.description && !isWYSIWYGContentEmpty(choice.description) && (
              <Text
                color="gray.600"
                fontSize="sm"
                mt={1}
                ml={6}
                fontStyle="italic"
                dangerouslySetInnerHTML={{ __html: choice.description }}
              />
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

export default MultipleChoiceQuestion
