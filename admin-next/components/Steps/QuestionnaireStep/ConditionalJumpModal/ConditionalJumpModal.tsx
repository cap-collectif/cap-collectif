import * as React from 'react'
import { useIntl } from 'react-intl'
import { Modal, Button, ButtonGroup, Heading, CapUIModalSize, FormLabel, Box } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { QuestionIds, multipleChoiceQuestions } from '../utils'
import ConditionalJumpItem from './ConditionalJumpItem'

type Props = { onSuccess: () => void; onClose: () => void; isNewJump?: boolean; fieldName: string }

export const ConditionalJumpModal: React.FC<Props> = ({ onClose, onSuccess, isNewJump = false, fieldName }) => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext()

  const questions = watch(`${fieldName}.questions`)
  const questionsWithJumps = watch(`${fieldName}.questionsWithJumps`)
  const temporaryJump = watch('temporaryJump')
  const {
    fields: jumps,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'temporaryJump.jumps',
  })

  React.useEffect(() => {
    if (temporaryJump && temporaryJump.id === temporaryJump.alwaysJumpDestinationQuestion?.id) {
      setValue('temporaryJump.alwaysJumpDestinationQuestion.id', null)
    }
  }, [temporaryJump?.id])

  const questionsWithNoJumps = questions
    .filter((x: QuestionIds) => !questionsWithJumps.some((f: QuestionIds) => f.id && x.id && f.id === x.id))
    .filter(q => multipleChoiceQuestions.includes(q.type))

  if (!isNewJump) questionsWithNoJumps.push(questions.find((q: QuestionIds) => q.id === temporaryJump.id))

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  const selectedQuestionId = watch(`temporaryJump.jumps.0.conditions.0.question.id`)

  const currentJump = watch('temporaryJump.jumps')

  const isDisabled = currentJump.some(
    j => j.conditions.some(c => !c.operator || !c.question?.id || !c.value?.id) || !j.destination?.id,
  )

  const isJumpComplete = !!(
    currentJump[currentJump.length - 1]?.conditions[0]?.value?.id &&
    currentJump[currentJump.length - 1]?.destination?.id
  )

  return (
    <Modal
      show
      hideOnClickOutside={false}
      onClose={onClose}
      size={CapUIModalSize.Xl}
      ariaLabel={intl.formatMessage({ id: 'create-form' })}
    >
      <Modal.Header>
        <Modal.Header.Label>{intl.formatMessage({ id: 'global.questionnaire' })}</Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'add-conditional-jumps' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        {jumps.map((jump, index) => (
          <ConditionalJumpItem
            key={jump.id}
            fieldName={fieldName}
            parentFormFieldName={`temporaryJump.jumps.${index}`}
            questionsWithNoJumps={questionsWithNoJumps}
            isChoiceDisabled={!isNewJump || jumps.length > 1}
            onRemove={jumps.length === 1 && !isNewJump ? undefined : () => remove(index)}
          />
        ))}
        {selectedQuestionId || !jumps.length ? (
          <Box bg="gray.100" p={2} borderRadius="accordion" mb={4} textAlign="center">
            <Button
              disabled={!isJumpComplete && jumps.length}
              variant="tertiary"
              variantColor="primary"
              onClick={() =>
                append({
                  conditions: [{ question: { id: selectedQuestionId } }],
                  origin: { id: selectedQuestionId },
                })
              }
            >
              {intl.formatMessage({ id: 'global.add' })}
            </Button>
          </Box>
        ) : null}
        <Box bg="gray.100" p={6} borderRadius="accordion">
          <FormControl name={`temporaryJump.alwaysJumpDestinationQuestion.id`} control={control}>
            <FormLabel
              htmlFor={`temporaryJump.alwaysJumpDestinationQuestion.id`}
              label={intl.formatMessage({ id: 'jump-other-goto' })}
            />
            <FieldInput
              key={`key__${temporaryJump?.alwaysJumpDestinationQuestion?.id}`}
              name={`temporaryJump.alwaysJumpDestinationQuestion.id`}
              control={control}
              type="select"
              disabled={!temporaryJump?.id}
              options={questions
                .filter((q: QuestionIds) => q.id !== temporaryJump?.id)
                .map((q: QuestionIds) => ({
                  label: q.title,
                  value: q.id,
                }))}
              onChange={val =>
                setValue(
                  'temporaryJump.alwaysJumpDestinationQuestion.title',
                  questions.find((q: QuestionIds) => q.id === val).title,
                )
              }
            />
          </FormControl>
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup>
          <Button variantSize="big" variant="secondary" variantColor="primary" onClick={onClose}>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button
            type="submit"
            variantSize="big"
            variant="primary"
            variantColor="primary"
            onClick={handleSuccess}
            disabled={!temporaryJump?.id || !temporaryJump.jumps.length || isDisabled}
            id="confirm-form-create"
          >
            {intl.formatMessage({ id: 'global.add' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  )
}
export default ConditionalJumpModal
