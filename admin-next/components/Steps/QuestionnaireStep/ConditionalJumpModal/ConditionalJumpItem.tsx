import * as React from 'react'
import { useIntl } from 'react-intl'
import { Box, ButtonQuickAction, CapUIIcon, FormLabel, InputGroup } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { QuestionIds } from '../utils'

type Props = {
  parentFormFieldName: string
  questionsWithNoJumps: Array<QuestionIds>
  isChoiceDisabled?: boolean
  onRemove?: () => void
  fieldName: string
}

export const ConditionalJumpItem: React.FC<Props> = ({
  parentFormFieldName,
  questionsWithNoJumps,
  isChoiceDisabled,
  onRemove,
  fieldName,
}) => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext()

  const questions = watch(`${fieldName}.questions`)
  const temporaryJump = watch('temporaryJump')

  const { fields: conditions } = useFieldArray({
    control,
    name: `${parentFormFieldName}.conditions`,
  })

  const selectedQuestionId = watch(`${parentFormFieldName}.conditions.0.question.id`)
  const currentJump = watch(`${parentFormFieldName}.conditions.0`)

  const operators = [
    { label: intl.formatMessage({ id: 'votes.is' }), value: 'IS' },
    { label: intl.formatMessage({ id: 'is-not' }), value: 'IS_NOT' },
  ]

  const usedChoices = temporaryJump.jumps
    .filter(jump => jump.conditions[0].operator === currentJump.operator)
    .map(j => j.conditions[0].value?.id)

  return (
    <Box bg="gray.100" p={6} borderRadius="accordion" mb={4} position="relative">
      {onRemove ? (
        <ButtonQuickAction
          variantColor="red"
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({ id: 'action_delete' })}
          onClick={onRemove}
          position="absolute"
          top={1}
          right={1}
          type="button"
        />
      ) : null}
      {conditions.map((condition, index) => {
        const formFieldName = `${parentFormFieldName}.conditions.${index}`
        const val = watch(`${formFieldName}.value.id`)
        return (
          <Box key={condition.id}>
            <FormLabel
              mb={1}
              label={intl.formatMessage({
                id: index ? 'and-if-the-answer-is' : 'if-the-question-answer-is',
              })}
            />
            <InputGroup wrap="nowrap">
              <FormControl name={`${formFieldName}.question.id`} control={control} minWidth="40%" maxWidth="40%">
                <FieldInput
                  name={`${formFieldName}.question.id`}
                  control={control}
                  type="select"
                  // @ts-ignore TODO: màj form
                  disabled={conditions.length > 1 || isChoiceDisabled}
                  options={questionsWithNoJumps.filter(Boolean).map((q: QuestionIds) => ({
                    label: q.title,
                    value: q.id || '',
                  }))}
                  onChange={val => {
                    setValue(`${formFieldName}.value.id`, null)
                    setValue(`${parentFormFieldName}.origin.id`, val)
                    setValue('temporaryJump.id', val)
                    setValue('temporaryJump.title', questions.find((q: QuestionIds) => q.id === val)?.title)
                  }}
                />
              </FormControl>
              <FormControl name={`${formFieldName}.operator`} control={control} minWidth="20%" maxWidth="20%">
                <FieldInput
                  name={`${formFieldName}.operator`}
                  control={control}
                  type="select"
                  // @ts-ignore TODO: màj form
                  disabled={false}
                  options={operators}
                  onChange={() => {
                    setValue(`${formFieldName}.value.id`, null)
                  }}
                />
              </FormControl>
              <FormControl name={`${formFieldName}.value.id`} control={control} minWidth="40%" maxWidth="40%">
                <FieldInput
                  key={`key__${selectedQuestionId}_${currentJump.operator}`}
                  name={`${formFieldName}.value.id`}
                  control={control}
                  type="select"
                  // @ts-ignore TODO: màj form
                  disabled={!currentJump.operator}
                  options={questions
                    .find((q: QuestionIds) => selectedQuestionId === q.id)
                    ?.choices?.map((choice: QuestionIds) => ({
                      label: choice.title,
                      value: choice.id,
                    }))
                    .filter(c => !usedChoices.includes(c.value) || val === c.value)}
                />
              </FormControl>
            </InputGroup>
          </Box>
        )
      })}
      <FormControl name={`${parentFormFieldName}.destination.id`} control={control}>
        <FormLabel
          htmlFor={`${parentFormFieldName}.destination.id`}
          label={intl.formatMessage({ id: 'then-go-to-question' })}
        />
        <FieldInput
          key={`key__${temporaryJump?.alwaysJumpDestinationQuestion?.id}`}
          name={`${parentFormFieldName}.destination.id`}
          control={control}
          type="select"
          // @ts-ignore TODO: màj form
          disabled={!temporaryJump?.id}
          options={questions
            .filter((q: QuestionIds) => q.id !== temporaryJump?.id)
            .map((q: QuestionIds) => ({
              label: q.title,
              value: q.id,
            }))}
          onChange={val =>
            setValue(`${parentFormFieldName}.destination.title`, questions.find((q: QuestionIds) => q.id === val).title)
          }
        />
      </FormControl>
    </Box>
  )
}
export default ConditionalJumpItem
