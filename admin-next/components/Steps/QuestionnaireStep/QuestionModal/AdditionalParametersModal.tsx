import { useEffect, type FC } from 'react'
import { useIntl } from 'react-intl'
import { MultiStepModal, Modal, Heading, Button, useMultiStepModal, CapUIIcon, FormLabel } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { useAppContext } from '@components/AppProvider/App.context'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { multipleChoiceQuestions } from '../utils'

type ChooseQuestionTypeProps = {
  onSuccess: () => void
  onCancel: () => void
  isNewQuestion: boolean
  isCollectStep: boolean
}

const AdditionalParametersModal: FC<ChooseQuestionTypeProps> = ({ onSuccess, isCollectStep, isNewQuestion }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const { hide, goToPreviousStep } = useMultiStepModal()
  const { watch, control, setValue } = useFormContext()

  const type = watch(`temporaryQuestion.type`)
  const validationRule = watch(`temporaryQuestion.validationRule`)

  const hasValidationRule = validationRule?.type?.labels?.[0] !== 'NONE' && validationRule

  const showLimits = ['checkbox', 'ranking'].includes(type)
  const canSortRandomly = multipleChoiceQuestions.includes(type)

  const choices = [
    {
      id: 'MIN',
      useIdAsValue: true,
      label: intl.formatMessage({
        id: 'answer_number.min',
      }),
    },
    {
      id: 'MAX',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'answer_number.max' }),
    },
    {
      id: 'EQUAL',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'answer_number.precise' }),
    },
    {
      id: 'NONE',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'answer_number.none' }),
    },
  ]

  const validationRuleNumber = () => (
    <FormControl name="temporaryQuestion.validationRule.number" control={control} mt={4} position="relative">
      <FormLabel
        htmlFor="temporaryQuestion.validationRule.number"
        label={intl.formatMessage({
          id: 'admin.fields.validation_rule.number',
        })}
      />
      <FieldInput
        id="temporaryQuestion.validationRule.number"
        name="temporaryQuestion.validationRule.number"
        control={control}
        type="number"
        step={1}
        min={1}
      />
    </FormControl>
  )

  useEffect(() => {
    if (showLimits && !validationRule) setValue('temporaryQuestion.validationRule.type', { labels: ['NONE'] })
  }, [showLimits])

  return (
    <>
      <MultiStepModal.Header>
        <Modal.Header.Label>{intl.formatMessage({ id: 'question_modal.create.title' })}</Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'additional-parameters' })}</Heading>
      </MultiStepModal.Header>
      <Modal.Body>
        <FormLabel label={intl.formatMessage({ id: 'global.options' })} mb={1} />
        {canSortRandomly ? (
          <FieldInput
            id={`temporaryQuestion.randomQuestionChoices`}
            name={`temporaryQuestion.randomQuestionChoices`}
            control={control}
            type="checkbox"
          >
            {intl.formatMessage({
              id: 'admin.fields.question.random_question_choices',
            })}
          </FieldInput>
        ) : null}
        <FieldInput
          id={`temporaryQuestion.required`}
          name={`temporaryQuestion.required`}
          control={control}
          type="checkbox"
        >
          {intl.formatMessage({
            id: 'global.admin.required',
          })}
        </FieldInput>
        {isCollectStep ? (
          <FieldInput
            id={`temporaryQuestion.private`}
            name={`temporaryQuestion.private`}
            control={control}
            type="checkbox"
          >
            {intl.formatMessage({
              id: 'admin.fields.question.private',
            })}
          </FieldInput>
        ) : null}
        {viewerSession.isSuperAdmin ? (
          <FieldInput
            id={`temporaryQuestion.hidden`}
            name={`temporaryQuestion.hidden`}
            control={control}
            type="checkbox"
          >
            {intl.formatMessage({
              id: 'hidden-question',
            })}
          </FieldInput>
        ) : null}
        {showLimits ? (
          <>
            <FormLabel label={intl.formatMessage({ id: 'customize_answer_number' })} mb={1} mt={4} />
            <FieldInput
              type="radio"
              name="temporaryQuestion.validationRule.type"
              id="temporaryQuestion.hidden"
              control={control}
              choices={choices}
            />
            {hasValidationRule ? validationRuleNumber() : null}
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" variantColor="primary" variantSize="big" onClick={goToPreviousStep}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          disabled={!type || (hasValidationRule && !validationRule?.number)}
          onClick={() => {
            onSuccess()
            hide()
          }}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({ id: isNewQuestion ? 'global.add' : 'global.edit' })}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default AdditionalParametersModal
