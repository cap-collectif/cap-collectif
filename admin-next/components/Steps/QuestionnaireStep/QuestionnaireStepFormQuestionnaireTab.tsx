import React, { useState } from 'react';
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
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FieldInput, FormControl } from '@cap-collectif/form';
import QuestionModal from './QuestionModal/QuestionModal';
import { QuestionIds, questionTypeToLabel } from './utils';
import { useMultipleDisclosure } from '@liinkiing/react-hooks';
import QuestionnaireStepFormJumpsTab from './QuestionnaireStepFormJumpsTab';
import { dispatchEvent } from '@utils/dispatchEvent';
import SectionModal from './SectionModal';
import uuid from '@utils/uuid';
import QuestionnaireListField from '@components/Form/QuestionnaireListField';

const QuestionnaireCreationTypeEnum = {
    NEW: 'NEW',
    MODEL: 'MODEL',
};

const ADD_NEW_QUESTION = -1;

const QuestionnaireStepFormQuestionnaire: React.FC = () => {
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useMultipleDisclosure({
        'question-modal': false,
        'section-modal': false,
    });
    const [questionIndex, setQuestionIndex] = useState(ADD_NEW_QUESTION);
    const [isSubSection, setIsSubSection] = useState(false);

    const { control, watch, setValue } = useFormContext();

    const {
        fields: questions,
        append,
        move,
        remove,
        update,
    } = useFieldArray({
        control,
        name: 'questionnaire.questions',
    });

    const { fields: questionsWithJumps } = useFieldArray({
        control,
        name: 'questionnaire.questionsWithJumps',
    });

    const questionsValues = watch('questionnaire.questions', questions);
    const questionsWithJumpsValues = watch('questionnaire.questionsWithJumps', questionsWithJumps);

    const temporaryQuestion = watch('temporaryQuestion');

    const onDragEnd = (result: { destination: { index: number }, source: { index: number } }) => {
        if (!result.destination || result.destination.index === result.source.index) {
            return;
        }
        move(result.source.index, result.destination.index);
    };

    return (
        <>
            {isOpen('question-modal') ? (
                <QuestionModal
                    isNewQuestion={questionIndex === ADD_NEW_QUESTION}
                    onClose={() => {
                        setValue('temporaryQuestion', {});
                        onClose('question-modal')();
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
                            });
                        else
                            update(questionIndex, {
                                ...temporaryQuestion,
                                choices: temporaryQuestion.choices
                                    ? temporaryQuestion.choice?.map(c => ({
                                          ...c,
                                          id: c.id ? c.id : uuid(),
                                      }))
                                    : undefined,
                            });
                        setValue('temporaryQuestion', {});
                    }}
                />
            ) : null}
            {isOpen('section-modal') ? (
                <SectionModal
                    isSubSection={isSubSection}
                    onClose={() => {
                        setValue('temporaryQuestion', {});
                        onClose('section-modal')();
                    }}
                    onSuccess={() => {
                        if (questionIndex === ADD_NEW_QUESTION)
                            append({
                                ...temporaryQuestion,
                                type: 'section',
                                level: isSubSection ? 1 : 0,
                                id: uuid(),
                            });
                        else update(questionIndex, temporaryQuestion);
                        setValue('temporaryQuestion', {});
                        onClose('section-modal')();
                    }}
                />
            ) : null}

            <FormControl name="questionnaire.description" control={control} mb={6}>
                <FormLabel
                    htmlFor="questionnaire.description"
                    label={intl.formatMessage({ id: 'global.intro' })}
                />
                <FieldInput
                    id="questionnaire.description"
                    name="questionnaire.description"
                    control={control}
                    type="textarea"
                    placeholder={intl.formatMessage({
                        id: 'questionnaire.explain_briefly',
                    })}
                />
            </FormControl>
            <Text>{intl.formatMessage({ id: 'admin.fields.questionnaire.questions' })}</Text>
            {questions.length ? (
                // @ts-ignore
                <DragnDrop onDragEnd={onDragEnd} backgroundColor="red">
                    <DragnDrop.List droppableId="questions">
                        {questions.map((question, index) => (
                            <DragnDrop.Item
                                draggableId={question.id}
                                index={index}
                                key={question.id}>
                                <ListCard.Item
                                    bg="white"
                                    borderRadius="normal"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    mb={1}
                                    mt={1}
                                    py={2}
                                    sx={{ '.cap-buttonGroup': { opacity: 0 } }}
                                    _hover={{ '.cap-buttonGroup': { opacity: 1 } }}
                                    draggable
                                    width="100%">
                                    <Flex direction="column">
                                        <Text color="gray.500" fontSize={1} fontWeight={400}>
                                            {questionsValues[index].level
                                                ? intl.formatMessage({
                                                      id: 'global.question.types.sub-section',
                                                  })
                                                : questionsValues[index].type
                                                ? intl.formatMessage({
                                                      id: questionTypeToLabel(
                                                          questionsValues[index].type,
                                                      ),
                                                  })
                                                : null}
                                        </Text>
                                        <Text color="blue.900" fontSize={2} fontWeight={600}>
                                            {questionsValues[index].title}
                                        </Text>
                                    </Flex>
                                    <ButtonGroup>
                                        <ButtonQuickAction
                                            variantColor="blue"
                                            icon={CapUIIcon.Pencil}
                                            label={intl.formatMessage({
                                                id: 'global.edit',
                                            })}
                                            onClick={() => {
                                                setValue(
                                                    'temporaryQuestion',
                                                    questionsValues[index],
                                                );
                                                setQuestionIndex(index);
                                                if (questionsValues[index].type === 'section') {
                                                    setIsSubSection(!!questionsValues[index].level);
                                                    onOpen('section-modal')();
                                                } else onOpen('question-modal')();
                                            }}
                                            type="button"
                                        />
                                        <ButtonQuickAction
                                            onClick={() => {
                                                remove(index);
                                                const jumpIndex =
                                                    questionsWithJumpsValues.findIndex(
                                                        (q: QuestionIds) =>
                                                            q.id === questionsValues[index].id,
                                                    );
                                                if (jumpIndex !== -1)
                                                    dispatchEvent('removeJump', {
                                                        index: jumpIndex,
                                                    });
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
                        ))}
                    </DragnDrop.List>
                </DragnDrop>
            ) : null}
            <Box mt={4}>
                <Menu
                    closeOnSelect={false}
                    disclosure={
                        <Button
                            variantColor="primary"
                            variant="secondary"
                            variantSize="small"
                            rightIcon={CapUIIcon.ArrowDown}>
                            {intl.formatMessage({ id: 'global.add' })}
                        </Button>
                    }>
                    <Menu.List>
                        <Menu.Item
                            onClick={() => {
                                setQuestionIndex(ADD_NEW_QUESTION);
                                onOpen('question-modal')();
                            }}>
                            {intl.formatMessage({ id: 'a-question' })}
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setQuestionIndex(ADD_NEW_QUESTION);
                                setIsSubSection(false);
                                onOpen('section-modal')();
                            }}>
                            {intl.formatMessage({ id: 'a-section' })}
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setQuestionIndex(ADD_NEW_QUESTION);
                                setIsSubSection(true);
                                onOpen('section-modal')();
                            }}>
                            {intl.formatMessage({ id: 'a-subsection' })}
                        </Menu.Item>
                    </Menu.List>
                </Menu>
            </Box>
            <Text mt={4}>{intl.formatMessage({ id: 'conditional-jumps' })}</Text>
            <QuestionnaireStepFormJumpsTab />
        </>
    );
};

const QuestionnaireStepFormQuestionnaireTab: React.FC = () => {
    const intl = useIntl();
    const { control, watch, setValue } = useFormContext();

    const questionnaireId = watch('questionnaire.questionnaireId');
    const isUsingModel = watch('isUsingModel');
    const isNewStep = !questionnaireId;

    return (
        <Accordion
            color={CapUIAccordionColor.Transparent}
            defaultAccordion={intl.formatMessage({
                id: 'global.questionnaire',
            })}>
            <Accordion.Item id={intl.formatMessage({ id: 'global.questionnaire' })}>
                <Accordion.Button>
                    {intl.formatMessage({ id: 'global.questionnaire' })}
                </Accordion.Button>
                <Accordion.Panel>
                    {isNewStep ? (
                        <Tabs mb={6}>
                            <Tabs.ButtonList ariaLabel="questionnaireType">
                                <Tabs.Button
                                    id={QuestionnaireCreationTypeEnum.NEW}
                                    onClick={() => setValue('isUsingModel', false)}>
                                    {intl.formatMessage({ id: 'global.new' })}
                                </Tabs.Button>
                                <Tabs.Button
                                    id={QuestionnaireCreationTypeEnum.MODEL}
                                    onClick={() => setValue('isUsingModel', true)}>
                                    {intl.formatMessage({ id: 'from_model' })}
                                </Tabs.Button>
                            </Tabs.ButtonList>
                            <Tabs.PanelList>
                                <Tabs.Panel>
                                    <QuestionnaireStepFormQuestionnaire />
                                </Tabs.Panel>
                                <Tabs.Panel>
                                    <FormControl
                                        name="questionnaireModel"
                                        control={control}
                                        isRequired={isUsingModel}>
                                        <FormLabel
                                            htmlFor="questionnaireModel"
                                            label={intl.formatMessage({
                                                id: 'global.questionnaire',
                                            })}
                                        />
                                        <QuestionnaireListField
                                            name="questionnaireModel"
                                            control={control}
                                        />
                                    </FormControl>
                                </Tabs.Panel>
                            </Tabs.PanelList>
                        </Tabs>
                    ) : (
                        <Box bg="gray.100" p={6} mb={6} borderRadius="accordion">
                            <QuestionnaireStepFormQuestionnaire />
                        </Box> // TODO mutation isnew ça passe
                    )}
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
};

export default QuestionnaireStepFormQuestionnaireTab;
