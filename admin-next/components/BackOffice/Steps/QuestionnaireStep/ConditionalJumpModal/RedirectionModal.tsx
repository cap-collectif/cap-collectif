import * as React from 'react'
import { useIntl } from 'react-intl'
import { Modal, Button, ButtonGroup, Heading, CapUIModalSize, FormLabel, Box } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { QuestionIds } from '../utils'

type Props = { onSuccess: () => void; onClose: () => void; isNewJump?: boolean; fieldName: string }

export const RedirectionModal: React.FC<Props> = ({ onClose, onSuccess, isNewJump = false, fieldName }) => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext()

  const questions = watch(`${fieldName}.questions`)
  const questionsWithJumps = watch(`${fieldName}.questionsWithJumps`)
  const temporaryJump = watch('temporaryJump')

  React.useEffect(() => {
    if (temporaryJump && temporaryJump.id === temporaryJump.alwaysJumpDestinationQuestion?.id) {
      setValue('temporaryJump.alwaysJumpDestinationQuestion.id', null)
    }
  }, [temporaryJump?.id])

  const questionsWithNoJumps = questions.filter(
    (x: QuestionIds) => !questionsWithJumps.some((f: QuestionIds) => f.id && x.id && f.id === x.id),
  )

  if (!isNewJump) questionsWithNoJumps.push(questions.find((q: QuestionIds) => q.id === temporaryJump.id))

  const handleSuccess = () => {
    setValue('temporaryJump.jumps', [])
    setValue('temporaryJump.destinationJumps', [])
    onSuccess()
    onClose()
  }

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
        <Heading>{intl.formatMessage({ id: 'add-redirection' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Box bg="gray.100" p={6} borderRadius="accordion">
          <FormControl name={`temporaryJump.id`} id={`temporaryJump.id`} control={control}>
            <FormLabel htmlFor={`temporaryJump.id`} label={intl.formatMessage({ id: 'by-answering-question' })} />
            <FieldInput
              name={`temporaryJump.id`}
              control={control}
              type="select"
              // @ts-ignore TODO: màj form
              disabled={!isNewJump}
              options={questionsWithNoJumps.filter(Boolean).map((q: QuestionIds) => ({
                label: q.title,
                value: q.id,
              }))}
              onChange={val => setValue('temporaryJump.title', questions.find((q: QuestionIds) => q.id === val).title)}
            />
          </FormControl>
          <FormControl
            name={`temporaryJump.alwaysJumpDestinationQuestion.id`}
            id={`temporaryJump.alwaysJumpDestinationQuestion.id`}
            control={control}
          >
            <FormLabel
              htmlFor={`temporaryJump.alwaysJumpDestinationQuestion.id`}
              label={intl.formatMessage({ id: 'always-go-to' })}
            />
            <FieldInput
              key={`key__${temporaryJump?.alwaysJumpDestinationQuestion?.id}`}
              name={`temporaryJump.alwaysJumpDestinationQuestion.id`}
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
            disabled={!temporaryJump?.id || !temporaryJump?.alwaysJumpDestinationQuestion?.id}
            id="confirm-form-create"
          >
            {intl.formatMessage({ id: 'global.add' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  )
}
export default RedirectionModal
