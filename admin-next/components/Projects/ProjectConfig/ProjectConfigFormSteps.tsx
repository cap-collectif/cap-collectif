import * as React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
    Button,
    ButtonGroup,
    ButtonQuickAction,
    CapUIIcon,
    DragnDrop,
    Flex,
    Heading,
    ListCard,
    Text,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';

const getWordingStep = (type: string) =>
    type === 'DebateStep' ? 'global.debate' : `${type.slice(0, -4).toLowerCase()}_step`;

const getStepUri = (type: string) => `${type.slice(0, -4).toLowerCase()}-step`;

const ProjectConfigFormSteps: React.FC = () => {
    const intl = useIntl();
    const { control, watch } = useFormContext();

    const stepsValues = watch('steps');

    const {
        fields: steps,
        move,
        remove,
    } = useFieldArray({
        control,
        name: `steps`,
    });

    const onDragEnd = (result: { destination: { index: number }, source: { index: number } }) => {
        if (!result.destination || result.destination.index === result.source.index) {
            return;
        }
        move(result.source.index, result.destination.index);
    };

    return (
        <Flex p={6} direction="column" spacing={8} backgroundColor="white" borderRadius="accordion">
            <Heading as="h4" fontWeight="semibold" color="blue.800">
                {intl.formatMessage({ id: 'project-header-step-modal-title' })}
            </Heading>
            <Flex direction="column" spacing={3}>
                {steps.length ? (
                    // @ts-ignore DragnDrop typings not on point yet
                    <DragnDrop onDragEnd={onDragEnd}>
                        <DragnDrop.List droppableId="steps">
                            {steps.map((step, index) => (
                                <DragnDrop.Item draggableId={step.id} index={index} key={step.id}>
                                    <ListCard.Item
                                        bg="gray.100"
                                        borderRadius="normal"
                                        borderWidth="1px"
                                        borderColor="gray.200"
                                        mb={1}
                                        mt={1}
                                        py={2}
                                        draggable
                                        width="100%"
                                        _hover={{ bg: 'gray.100' }}>
                                        <Flex direction="column">
                                            <Text color="gray.500" fontSize={1} fontWeight={400}>
                                                {intl.formatMessage({
                                                    id: getWordingStep(
                                                        stepsValues[index].__typename,
                                                    ),
                                                })}
                                            </Text>
                                            <Text color="blue.900" fontSize={2} fontWeight={600}>
                                                {stepsValues[index].label}
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
                                                    window.location.href += `/update-step/${getStepUri(
                                                        stepsValues[index].__typename,
                                                    )}/${stepsValues[index].id}`;
                                                }}
                                                type="button"
                                            />
                                            <ButtonQuickAction
                                                // TODO : Modal
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
                ) : (
                    intl.formatMessage({ id: 'configure-project-steps' })
                )}
            </Flex>
            <div>
                <Button
                    variant="secondary"
                    leftIcon={CapUIIcon.Add}
                    onClick={() => (window.location.href += '/create-step')}>
                    {intl.formatMessage({ id: 'global.add' })}
                </Button>
            </div>
        </Flex>
    );
};

export default ProjectConfigFormSteps;
