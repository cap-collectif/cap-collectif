import React, { useEffect } from 'react';
import {
    Accordion,
    Box,
    Button,
    CapUIAccordionColor,
    Flex,
    FormLabel,
    Text,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { FieldInput, FormControl } from '@cap-collectif/form';
import UpdateQuestionnaireStepMutation from '@mutations/UpdateQuestionnaireStepMutation';
import TextEditor from '../../Form/TextEditor/TextEditor';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { QuestionnaireStepFormQuery } from '@relay/QuestionnaireStepFormQuery.graphql';
import { UpdateQuestionnaireStepInput } from '@relay/UpdateQuestionnaireStepMutation.graphql';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import { useNavBarContext } from '@components/NavBar/NavBar.context';
import DeleteStepMutation from '@mutations/DeleteStepMutation';
import { StepDurationTypeEnum } from '../DebateStep/DebateStepForm';
import QuestionnaireStepRequirementsTabs from '@components/Requirements/QuestionnaireStepRequirementsTabs';
import {
    getRequirementsInput,
    RequirementsFormValues,
} from '@components/Requirements/Requirements';
import QuestionnaireStepOptionalParameters from './QuestionnaireStepFormOptionalParameters';
import QuestionnaireStepFormQuestionnaireTab from './QuestionnaireStepFormQuestionnaireTab';
import { formatQuestions } from './utils';

type Props = {
    stepId: string,
};

type FormValues = {
    id: string,
    label: string,
    body: string | null,
    title: string,
    startAt: string | null,
    endAt: string | null,
    timeless: boolean,
    isAnonymousParticipationAllowed: boolean,
    metaDescription: string | null,
    customCode: string | null,
    stepDurationType?: {
        labels: Array<string>,
    },
    questionnaire: { id: string, title: string, description: string, questions: Array<any> },
} & RequirementsFormValues;

const QUESTIONNAIRE_STEP_QUERY = graphql`
    query QuestionnaireStepFormQuery($stepId: ID!) {
        step: node(id: $stepId) {
            id
            ... on QuestionnaireStep {
                title
                label
                body
                timeRange {
                    startAt
                    endAt
                }
                enabled
                timeless
                isAnonymousParticipationAllowed
                metaDescription
                customCode
                footer
                project {
                    id
                    title
                    canEdit
                    adminAlphaUrl
                }
                questionnaire {
                    id
                    title
                    description
                    questions {
                        id
                        ...responsesHelper_adminQuestion @relay(mask: false)
                    }
                }
                ...QuestionnaireStepRequirementsTabs_questionnaireStep
            }
        }
        availableLocales(includeDisabled: false) {
            code
            isDefault
        }
    }
`;

const QuestionnaireStepForm: React.FC<Props> = ({ stepId }) => {
    const intl = useIntl();
    const query = useLazyLoadQuery<QuestionnaireStepFormQuery>(QUESTIONNAIRE_STEP_QUERY, {
        stepId,
    });

    const { setBreadCrumbItems } = useNavBarContext();

    const { step, availableLocales } = query;
    const project = step?.project;

    if (!step) return null;

    const defaultLocale =
        availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr';

    const isEditing = !!step?.label;

    const getBreadCrumbItems = () => {
        const breadCrumbItems = [
            {
                title: project?.title ?? '',
                href: project?.adminAlphaUrl ?? '',
            },
            {
                title: intl.formatMessage({ id: 'add-step' }),
                href: `/project/${project?.id}/create-step`,
            },
            {
                title: intl.formatMessage({ id: 'questionnaire-step' }),
                href: '',
            },
        ];
        if (isEditing) {
            return breadCrumbItems.filter(
                item => item.title !== intl.formatMessage({ id: 'add-step' }),
            );
        }
        return breadCrumbItems;
    };

    useEffect(() => {
        setBreadCrumbItems(getBreadCrumbItems());
        return () => setBreadCrumbItems([]);
    }, []);

    const getDefaultValues = (): FormValues => {
        const stepDurationType = step
            ? step?.timeless
                ? [StepDurationTypeEnum.TIMELESS]
                : [StepDurationTypeEnum.CUSTOM]
            : [StepDurationTypeEnum.TIMELESS];

        return {
            id: stepId,
            label: step?.label ?? '',
            body: step?.body ?? '',
            title: step?.title ?? '',
            startAt: step?.timeRange?.startAt ?? null,
            endAt: step?.timeRange?.endAt ?? null,
            timeless: step ? step?.timeless ?? false : true,
            stepDurationType: {
                labels: stepDurationType,
            },
            isAnonymousParticipationAllowed: step?.isAnonymousParticipationAllowed ?? false,
            metaDescription: step?.metaDescription ?? '',
            customCode: step?.customCode ?? '',
            questionnaire: {
                id: step?.questionnaire?.id ?? '',
                title: step?.questionnaire?.title ?? '',
                description: step?.questionnaire?.description ?? '',
                questions: step?.questionnaire ? formatQuestions(step.questionnaire) : [],
            },
            requirements: [],
            requirementsReason: '',
        };
    };

    const formMethods = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: getDefaultValues(),
        shouldUnregister: false,
    });

    const { handleSubmit, formState, control, watch } = formMethods;
    const { isSubmitting, isValid } = formState;

    const onSubmit = async (values: FormValues) => {
        console.log('onSubmit: ', values);
        // TODO : correctly format values with temporary ids, should I do two mutations ?
        /*  
        const input: UpdateQuestionnaireStepInput = {
            ...values,
            ...getRequirementsInput(values),
        };
      
        try {
            const response = await UpdateQuestionnaireStepMutation.commit({ input });
            const adminAlphaUrl =
                response.updateQuestionnaireStep?.questionnaireStep?.project?.adminAlphaUrl;
            if (adminAlphaUrl) {
                return (window.location.href = adminAlphaUrl);
            }
        } catch (error) {
            return mutationErrorToast(intl);
        }*/
    };

    const onBack = async () => {
        const adminAlphaUrl = project?.adminAlphaUrl;
        if (!adminAlphaUrl) {
            return;
        }

        if (!isEditing) {
            window.location.href = adminAlphaUrl;
            return;
        }

        try {
            await DeleteStepMutation.commit({ input: { stepId } });
            window.location.href = adminAlphaUrl;
        } catch (error) {
            return mutationErrorToast(intl);
        }
    };

    const stepDurationType = watch('stepDurationType');
    const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM;

    return (
        <Box bg="white" width="100%" p={6} borderRadius="8px">
            <Text fontWeight={600} color="blue.800" fontSize={4}>
                {intl.formatMessage({ id: 'customize-your-questionnaire-step' })}
            </Text>
            <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
                <FormProvider {...formMethods}>
                    <FormControl name="label" control={control} isRequired mb={6}>
                        <FormLabel
                            htmlFor="label"
                            label={intl.formatMessage({ id: 'step-label-name' })}
                        />
                        <FieldInput
                            id="label"
                            name="label"
                            control={control}
                            type="text"
                            placeholder={intl.formatMessage({ id: 'step-label-name-placeholder' })}
                        />
                    </FormControl>
                    <FormProvider {...formMethods}>
                        <TextEditor
                            name="body"
                            label={intl.formatMessage({ id: 'step-description' })}
                            platformLanguage={defaultLocale}
                            selectedLanguage={defaultLocale}
                        />
                    </FormProvider>
                    <FormControl name="stepDurationType" control={control} isRequired mb={6}>
                        <FormLabel
                            htmlFor="stepDurationType"
                            label={intl.formatMessage({ id: 'step-duration' })}
                        />
                        <FieldInput
                            id="stepDurationType"
                            name="stepDurationType"
                            control={control}
                            type="radio"
                            choices={[
                                {
                                    id: StepDurationTypeEnum.TIMELESS,
                                    label: intl.formatMessage({ id: 'timeless' }),
                                    useIdAsValue: true,
                                },
                                {
                                    id: StepDurationTypeEnum.CUSTOM,
                                    label: intl.formatMessage({ id: 'global.custom.feminine' }),
                                    useIdAsValue: true,
                                },
                            ]}
                        />
                    </FormControl>
                    {isCustomStepDuration ? (
                        <Flex mb={4}>
                            <FormControl
                                name="startAt"
                                control={control}
                                width="max-content"
                                mr={6}
                                mb={0}>
                                <FormLabel
                                    htmlFor="startAt"
                                    label={intl.formatMessage({ id: 'start-date' })}>
                                    <Text fontSize={2} color="gray.500">
                                        {intl.formatMessage({ id: 'global.optional' })}
                                    </Text>
                                </FormLabel>
                                <FieldInput
                                    id="startAt"
                                    name="startAt"
                                    control={control}
                                    type="dateHour"
                                />
                            </FormControl>
                            <FormControl name="endAt" control={control} width="max-content">
                                <FormLabel
                                    htmlFor="endAt"
                                    label={intl.formatMessage({ id: 'ending-date' })}>
                                    <Text fontSize={2} color="gray.500">
                                        {intl.formatMessage({ id: 'global.optional' })}
                                    </Text>
                                </FormLabel>
                                <FieldInput
                                    id="endAt"
                                    name="endAt"
                                    control={control}
                                    type="dateHour"
                                />
                            </FormControl>
                        </Flex>
                    ) : null}
                    <QuestionnaireStepFormQuestionnaireTab />
                    <Accordion color={CapUIAccordionColor.Transparent}>
                        <Accordion.Item
                            id={intl.formatMessage({ id: 'required-infos-to-participate' })}>
                            <Accordion.Button>
                                {intl.formatMessage({ id: 'required-infos-to-participate' })}
                            </Accordion.Button>
                            <Accordion.Panel>
                                <QuestionnaireStepRequirementsTabs
                                    formMethods={formMethods}
                                    questionnaireStep={step}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                    <QuestionnaireStepOptionalParameters
                        isEditing={isEditing}
                        defaultLocale={defaultLocale}
                        selectedLocale={defaultLocale}
                    />
                    <Flex mt={6}>
                        <Button
                            variantSize="big"
                            variant="primary"
                            type="submit"
                            mr={4}
                            isLoading={isSubmitting}
                            disabled={!isValid}>
                            {isEditing
                                ? intl.formatMessage({ id: 'global.save' })
                                : intl.formatMessage({ id: 'add-the-step' })}
                        </Button>
                        <Button
                            variantSize="big"
                            variant="secondary"
                            disabled={isSubmitting}
                            onClick={onBack}>
                            {intl.formatMessage({ id: 'global.back' })}
                        </Button>
                    </Flex>
                </FormProvider>
            </Box>
        </Box>
    );
};

export default QuestionnaireStepForm;
