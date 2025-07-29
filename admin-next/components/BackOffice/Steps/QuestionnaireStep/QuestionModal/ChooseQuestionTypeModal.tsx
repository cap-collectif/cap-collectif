import type { FC } from 'react'
import { useIntl } from 'react-intl'
import { Flex, Text, MultiStepModal, Modal, Heading, Button, useMultiStepModal, CapUIIcon } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { QuestionCategory, QuestionTypes } from '../utils'

type ChooseQuestionTypeProps = { onCancel: () => void }

const ChooseQuestionTypeModal: FC<ChooseQuestionTypeProps> = ({ onCancel }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const { hide, goToNextStep } = useMultiStepModal()
  const { watch, setValue } = useFormContext()

  const temporaryQuestion = watch(`temporaryQuestion`)

  const type = temporaryQuestion?.type

  const questionCategories: Array<QuestionCategory> = [
    'TEXT',
    'NUMERIC',
    'DOCUMENT',
    'UNIQUE_CHOICE',
    'MULTIPLE_CHOICE',
  ]
  if (viewerSession.isSuperAdmin) questionCategories.push('LEGAL')

  return (
    <>
      <MultiStepModal.Header>
        <Modal.Header.Label>{intl.formatMessage({ id: 'question_modal.create.title' })}</Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'select-question-type' })}</Heading>
      </MultiStepModal.Header>
      <Modal.Body pt={0}>
        <Flex wrap="wrap" justify="flex-start">
          {questionCategories.map((key, idx) => (
            <Flex direction="column" width="33%" alignItems="flex-start" key={idx}>
              <Text mb={2} mt={4}>
                {intl.formatMessage({ id: QuestionTypes[key].label })}
              </Text>
              {QuestionTypes[key].values.map((value, idx) => (
                <Button
                  data-cy={value.label}
                  key={idx}
                  mb={2}
                  variant={type === value.type ? 'primary' : 'secondary'}
                  variantColor="hierarchy"
                  onClick={() => {
                    setValue('temporaryQuestion', {
                      type: value.type === type ? '' : value.type,
                      title: temporaryQuestion?.title,
                      description: temporaryQuestion?.description,
                      helpText: temporaryQuestion?.helpText,
                    })
                  }}
                >
                  {intl.formatMessage({ id: value.label })}
                </Button>
              ))}
            </Flex>
          ))}
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="big"
          onClick={() => {
            onCancel()
            hide()
          }}
        >
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          data-cy="next-step"
          variant="primary"
          variantColor="primary"
          variantSize="big"
          disabled={!type}
          onClick={goToNextStep}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({ id: 'global.next' })}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default ChooseQuestionTypeModal
