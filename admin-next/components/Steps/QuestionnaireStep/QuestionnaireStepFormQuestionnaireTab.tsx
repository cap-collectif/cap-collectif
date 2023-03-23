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
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FieldInput, FormControl } from '@cap-collectif/form';
import QuestionModal from './QuestionModal/QuestionModal';
import { questionTypeToLabel } from './utils';
import { useDisclosure } from '@liinkiing/react-hooks';

const QuestionnaireCreationTypeEnum = {
    NEW: 'NEW',
    MODEL: 'MODEL',
};

const ADD_NEW_QUESTION = -1;

const QuestionnaireStepFormQuestionnaireTab: React.FC = () => {
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const [questionIndex, setQuestionIndex] = useState(ADD_NEW_QUESTION);

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

    const questionsValues = watch('questionnaire.questions', questions);
    const temporaryQuestion = watch('temporaryQuestion');

    const onDragEnd = result => {
        if (!result.destination || result.destination.index === result.source.index) {
            return;
        }
        move(result.source.index, result.destination.index);
    };

    return (
        <>
            {isOpen ? (
                <QuestionModal
                    onClose={() => {
                        setValue('temporaryQuestion', {});
                        onClose();
                    }}
                    onSuccess={() => {
                        if (questionIndex === ADD_NEW_QUESTION) append(temporaryQuestion);
                        else update(questionIndex, temporaryQuestion);
                        setValue('temporaryQuestion', {});
                    }}
                />
            ) : null}
            <Tabs mb={6}>
                <Tabs.ButtonList ariaLabel="questionnaireType">
                    <Tabs.Button id={QuestionnaireCreationTypeEnum.NEW}>
                        {intl.formatMessage({ id: 'global.new' })}
                    </Tabs.Button>
                    <Tabs.Button id={QuestionnaireCreationTypeEnum.MODEL}>
                        {intl.formatMessage({ id: 'from_model' })}
                    </Tabs.Button>
                </Tabs.ButtonList>
                <Tabs.PanelList>
                    <Tabs.Panel>
                        <FormControl
                            name="questionnaire.description"
                            control={control}
                            isRequired
                            mb={6}>
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
                        {questions.length ? (
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
                                                border="1px"
                                                mb={1}
                                                mt={1}
                                                sx={{ '.cap-buttonGroup': { opacity: 0 } }}
                                                _hover={{ '.cap-buttonGroup': { opacity: 1 } }}
                                                draggable
                                                width="100%">
                                                <Flex direction="column">
                                                    <Text
                                                        color="gray.500"
                                                        fontSize={1}
                                                        fontWeight={400}>
                                                        {questionsValues[index].type
                                                            ? intl.formatMessage({
                                                                  id: questionTypeToLabel(
                                                                      questionsValues[index].type,
                                                                  ),
                                                              })
                                                            : null}
                                                    </Text>
                                                    <Text
                                                        color="blue.900"
                                                        fontSize={2}
                                                        fontWeight={600}>
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
                                                            onOpen();
                                                        }}
                                                        type="button"
                                                    />
                                                    <ButtonQuickAction
                                                        onClick={() => remove(index)}
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
                                            setQuestionIndex(-1);
                                            onOpen();
                                        }}>
                                        {intl.formatMessage({ id: 'a-question' })}
                                    </Menu.Item>
                                </Menu.List>
                            </Menu>
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel>ok</Tabs.Panel>
                </Tabs.PanelList>
            </Tabs>
        </>
    );
};

export default QuestionnaireStepFormQuestionnaireTab;
