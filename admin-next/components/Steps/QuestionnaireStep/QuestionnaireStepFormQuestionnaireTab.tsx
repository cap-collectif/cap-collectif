import React, { useEffect, useState } from 'react'
import {
  Button,
  Tabs,
  FormLabel,
  CapUIIcon,
  Menu,
  DragnDrop,
  ListCard,
  Flex,
  ButtonGroup,
  ButtonQuickAction,
  Text,
  Box,
  Accordion,
  CapUIAccordionColor,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import QuestionModal from './QuestionModal/QuestionModal'
import { QuestionIds, duplicate, formatJumpsToTmp, formatQuestions, questionTypeToLabel } from './utils'
import { useMultipleDisclosure } from '@liinkiing/react-hooks'
import QuestionnaireStepFormJumpsTab from './QuestionnaireStepFormJumpsTab'
import { dispatchEvent } from '@utils/dispatchEvent'
import SectionModal from './SectionModal'
import uuid from '@shared/utils/uuid'
import QuestionnaireListField from '@components/Form/QuestionnaireListField'
import debounce from '@shared/utils/debounce-promise'
import stripHTML from '@shared/utils/stripHTML'

const QuestionnaireCreationTypeEnum = {
  NEW: 'NEW',
  MODEL: 'MODEL',
}

const ADD_NEW_QUESTION = -1
const MODEL = 'MODEL'

export const QuestionnaireStepFormQuestionnaire: React.FC<{
  model?: boolean
  defaultLocale?: string
  proposalFormKey?: string
  openQuestionModal?: boolean
  setOpenQuestionModal?: (boolean) => void
}> = ({ model = false, defaultLocale, proposalFormKey, openQuestionModal, setOpenQuestionModal }) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useMultipleDisclosure({
    'question-modal': false,
    'section-modal': false,
  })
  const isCollectStep = !!proposalFormKey
  const [questionIndex, setQuestionIndex] = useState(ADD_NEW_QUESTION)
  const [isSubSection, setIsSubSection] = useState(false)

  const { control, watch, setValue } = useFormContext()

  useEffect(() => {
    if (isCollectStep && openQuestionModal) {
      setQuestionIndex(ADD_NEW_QUESTION)
      onOpen('question-modal')()
    }
  }, [openQuestionModal, onOpen, isCollectStep])

  const fieldName = proposalFormKey
    ? `${proposalFormKey}.questionnaire`
    : model
    ? `${MODEL}questionnaire`
    : 'questionnaire'

  const {
    fields: questions,
    append,
    move,
    remove,
    update,
    insert,
  } = useFieldArray({
    control,
    name: `${fieldName}.questions`,
  })

  const { fields: questionsWithJumps } = useFieldArray({
    control,
    name: `${fieldName}.questionsWithJumps`,
  })

  const questionsValues = watch(`${fieldName}.questions`, questions)
  const questionsWithJumpsValues = watch(`${fieldName}.questionsWithJumps`, questionsWithJumps)

  const temporaryQuestion = watch('temporaryQuestion')

  const onDragEnd = (result: { destination: { index: number }; source: { index: number } }) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return
    }
    move(result.source.index, result.destination.index)
  }

  const onDuplicate = debounce(duplicateFunction => duplicateFunction(), 200)

  return (
    <>
      {isOpen('question-modal') ? (
        <QuestionModal
          isCollectStep={isCollectStep}
          defaultLocale={defaultLocale}
          isNewQuestion={questionIndex === ADD_NEW_QUESTION}
          onClose={() => {
            if (setOpenQuestionModal) setOpenQuestionModal(false)
            setValue('temporaryQuestion', {})
            onClose('question-modal')()
          }}
          onSuccess={() => {
            if (questionIndex === ADD_NEW_QUESTION)
              append({
                ...temporaryQuestion,
                id: uuid(),
                choices: temporaryQuestion.choices
                  ? temporaryQuestion.choices.map(c => ({
                      ...c,
                      id: uuid(),
                    }))
                  : undefined,
              })
            else
              update(questionIndex, {
                ...temporaryQuestion,
                choices: temporaryQuestion.choices
                  ? temporaryQuestion.choices?.map(c => ({
                      ...c,
                      id: c.id ? c.id : uuid(),
                    }))
                  : undefined,
              })
            setValue('temporaryQuestion', {})
          }}
        />
      ) : null}
      {isOpen('section-modal') ? (
        <SectionModal
          isSubSection={isSubSection}
          onClose={() => {
            setValue('temporaryQuestion', {})
            onClose('section-modal')()
          }}
          onSuccess={() => {
            if (questionIndex === ADD_NEW_QUESTION)
              append({
                ...temporaryQuestion,
                type: 'section',
                level: isSubSection ? 1 : 0,
                id: uuid(),
              })
            else update(questionIndex, temporaryQuestion)
            setValue('temporaryQuestion', {})
            onClose('section-modal')()
          }}
        />
      ) : null}

      {!isCollectStep ? (
        <>
          <FormControl name={`${fieldName}.description`} control={control} mb={6}>
            <FormLabel htmlFor={`${fieldName}.description`} label={intl.formatMessage({ id: 'global.intro' })} />
            <FieldInput
              id={`${fieldName}.description`}
              name={`${fieldName}.description`}
              control={control}
              type="textarea"
              placeholder={intl.formatMessage({
                id: 'questionnaire.explain_briefly',
              })}
            />
          </FormControl>
          <Text>{intl.formatMessage({ id: 'admin.fields.questionnaire.questions' })}</Text>
        </>
      ) : null}
      {questions.length ? (
        // @ts-ignore
        <DragnDrop onDragEnd={onDragEnd} backgroundColor="red">
          <DragnDrop.List droppableId="questions">
            {questions.map((question, index) => {
              const firstSectionIndex = questionsValues.findIndex(q => q.type === 'section' || q.level)
              const hasSectionOrSubsectionBefore = firstSectionIndex !== -1 && firstSectionIndex < index
              const type = questionsValues[index]?.type
              const isSection = type === 'section'
              const isSubSection = questionsValues[index]?.level
              return (
                // @ts-expect-error MAJ DS Props
                <DragnDrop.Item draggableId={question.id} index={index} key={question.id}>
                  <ListCard.Item
                    bg="white"
                    borderRadius="normal"
                    borderWidth="1px"
                    borderColor="gray.200"
                    mb={1}
                    mt={1}
                    pl={isSubSection ? 6 : isSection ? 4 : hasSectionOrSubsectionBefore ? 8 : 4}
                    sx={{ '.cap-buttonGroup': { opacity: 0 } }}
                    _hover={{ '.cap-buttonGroup': { opacity: 1 } }}
                    draggable
                    width="100%"
                  >
                    <Flex direction="column">
                      <Text color="gray.500" fontSize={1} fontWeight={400} lineHeight={1.5}>
                        {isSubSection
                          ? intl.formatMessage({
                              id: 'global.question.types.sub-section',
                            })
                          : type
                          ? intl.formatMessage({
                              id: questionTypeToLabel(type),
                            })
                          : null}
                      </Text>
                      <Text color="blue.900" fontSize={2} fontWeight={600} lineHeight={1.5}>
                        {questionsValues[index]?.title}
                      </Text>
                    </Flex>
                    <ButtonGroup>
                      {isSection || isSubSection ? null : (
                        <ButtonQuickAction
                          tooltipZIndex={2}
                          variantColor="blue"
                          icon={CapUIIcon.Duplicate}
                          label={intl.formatMessage({
                            id: 'duplicate',
                          })}
                          onClick={() => {
                            onDuplicate(() => insert(index + 1, duplicate(questionsValues[index], intl)))
                          }}
                          type="button"
                        />
                      )}
                      <ButtonQuickAction
                        tooltipZIndex={2}
                        variantColor="blue"
                        icon={CapUIIcon.Pencil}
                        label={intl.formatMessage({
                          id: 'global.edit',
                        })}
                        onClick={() => {
                          setValue('temporaryQuestion', questionsValues[index])
                          setQuestionIndex(index)
                          if (type === 'section') {
                            setIsSubSection(!!questionsValues[index]?.level)
                            onOpen('section-modal')()
                          } else onOpen('question-modal')()
                        }}
                        type="button"
                      />
                      <ButtonQuickAction
                        tooltipZIndex={2}
                        onClick={() => {
                          remove(index)
                          const jumpIndex = questionsWithJumpsValues.findIndex(
                            (q: QuestionIds) => q.id === questionsValues[index]?.id,
                          )
                          if (jumpIndex !== -1)
                            dispatchEvent('removeJump', {
                              index: jumpIndex,
                            })
                        }}
                        variantColor="red"
                        icon={CapUIIcon.Trash}
                        label={intl.formatMessage({
                          id: 'global.delete',
                        })}
                        type="button"
                      />
                    </ButtonGroup>
                  </ListCard.Item>
                </DragnDrop.Item>
              )
            })}
          </DragnDrop.List>
        </DragnDrop>
      ) : null}
      {!isCollectStep ? (
        <Box mt={4}>
          <Menu
            placement="bottom-start"
            closeOnSelect={false}
            disclosure={
              <Button
                variantColor="primary"
                variant="secondary"
                variantSize="small"
                rightIcon={CapUIIcon.ArrowDown}
                id="add-question-btn"
              >
                {intl.formatMessage({ id: 'global.add' })}
              </Button>
            }
          >
            <Menu.List>
              <Menu.Item
                id="open-question-modal"
                onClick={() => {
                  setQuestionIndex(ADD_NEW_QUESTION)
                  onOpen('question-modal')()
                }}
              >
                {intl.formatMessage({ id: 'a-question' })}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  setQuestionIndex(ADD_NEW_QUESTION)
                  setIsSubSection(false)
                  onOpen('section-modal')()
                }}
              >
                {intl.formatMessage({ id: 'a-section' })}
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  setQuestionIndex(ADD_NEW_QUESTION)
                  setIsSubSection(true)
                  onOpen('section-modal')()
                }}
              >
                {intl.formatMessage({ id: 'a-subsection' })}
              </Menu.Item>
            </Menu.List>
          </Menu>
        </Box>
      ) : null}

      {questions.length || !isCollectStep ? (
        <Box mb={isCollectStep ? 4 : 0}>
          <Text mt={4}>{intl.formatMessage({ id: 'conditional-jumps' })}</Text>
          <QuestionnaireStepFormJumpsTab fieldName={fieldName} />
        </Box>
      ) : null}
    </>
  )
}

const QuestionnaireStepFormQuestionnaireTab: React.FC<{
  isEditing: boolean
  defaultLocale?: string
  setHelpMessage: React.Dispatch<React.SetStateAction<string | null>>
}> = ({ isEditing, defaultLocale, setHelpMessage }) => {
  const intl = useIntl()
  const { control, watch, setValue } = useFormContext()

  const isUsingModel = watch('isUsingModel')
  const questionnaireModel = watch('questionnaireModel')

  const onChange = (newValue: { label: string; value: string; questionnaire }) => {
    setValue(`${MODEL}questionnaire.title`, newValue.questionnaire.title)
    setValue(`${MODEL}questionnaire.description`, stripHTML(newValue.questionnaire.description))
    setValue(`${MODEL}questionnaire.questions`, formatQuestions(newValue.questionnaire, true))
    setValue(`${MODEL}questionnaire.questionsWithJumps`, formatJumpsToTmp(newValue.questionnaire.questionsWithJumps))
  }

  return (
    <Accordion
      color={CapUIAccordionColor.Transparent}
      defaultAccordion={[intl.formatMessage({ id: 'global.questionnaire' })]}
    >
      <Accordion.Item
        id={intl.formatMessage({ id: 'global.questionnaire' })}
        onMouseEnter={() => {
          setHelpMessage('step.create.questionnaire.helpText')
        }}
        onMouseLeave={() => setHelpMessage(null)}
      >
        <Accordion.Button>{intl.formatMessage({ id: 'global.questionnaire' })}</Accordion.Button>
        <Accordion.Panel>
          {!isEditing ? (
            <Tabs mb={6}>
              <Tabs.ButtonList ariaLabel="questionnaireType">
                <Tabs.Button id={QuestionnaireCreationTypeEnum.NEW} onClick={() => setValue('isUsingModel', false)}>
                  {intl.formatMessage({ id: 'global.new' })}
                </Tabs.Button>
                <Tabs.Button id={QuestionnaireCreationTypeEnum.MODEL} onClick={() => setValue('isUsingModel', true)}>
                  {intl.formatMessage({ id: 'from_model' })}
                </Tabs.Button>
              </Tabs.ButtonList>
              <Tabs.PanelList>
                <Tabs.Panel>
                  <QuestionnaireStepFormQuestionnaire defaultLocale={defaultLocale} />
                </Tabs.Panel>
                <Tabs.Panel>
                  <FormControl name="questionnaireModel" control={control} isRequired={isUsingModel}>
                    <FormLabel
                      htmlFor="questionnaireModel"
                      label={intl.formatMessage({
                        id: 'global.questionnaire',
                      })}
                    />
                    <QuestionnaireListField name="questionnaireModel" control={control} onChange={onChange} />
                  </FormControl>
                  {questionnaireModel ? (
                    <QuestionnaireStepFormQuestionnaire key="model" model defaultLocale={defaultLocale} />
                  ) : null}
                </Tabs.Panel>
              </Tabs.PanelList>
            </Tabs>
          ) : (
            <Box bg="gray.100" p={6} mb={6} borderRadius="accordion">
              <QuestionnaireStepFormQuestionnaire defaultLocale={defaultLocale} />
            </Box>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default QuestionnaireStepFormQuestionnaireTab
