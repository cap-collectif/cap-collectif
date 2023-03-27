import React, {useEffect} from 'react';
import {
    Accordion,
    Box,
    Button,
    CapUIAccordionColor,
    Tabs,
    Flex,
    FormLabel,
    Text,
    CapUIIcon,
    Switch,
    Input,
} from '@cap-collectif/ui';
import {useIntl} from "react-intl";
import {FormProvider, useFieldArray, useForm} from "react-hook-form";
import {FieldInput, FormControl} from '@cap-collectif/form';
import UpdateDebateStepMutation from "@mutations/UpdateDebateStepMutation";
import TextEditor from "../../Form/TextEditor/TextEditor";
import DebateWidgetIntegrationForm from "@components/Steps/DebateStep/DebateWidgetIntegrationForm";
import {graphql, useLazyLoadQuery} from "react-relay";
import {DebateStepFormQuery, DebateType} from "@relay/DebateStepFormQuery.graphql";
import FaceToFace from './FaceToFace'
import {UpdateDebateStepInput} from "@relay/UpdateDebateStepMutation.graphql";
import {mutationErrorToast} from "@utils/mutation-error-toast";
import {useNavBarContext} from "@components/NavBar/NavBar.context";
import DeleteStepMutation from "@mutations/DeleteStepMutation";

type Props = {
    stepId: string
};

type Article = { id: string, url: string };

type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS';
type EnabledUnion = 'PUBLISHED' | 'DRAFT';
type ParticipationTypeUnion = 'WITH_ACCOUNT' | 'WITHOUT_ACCOUNT';


type FormValues = {
    id: string
    label: string
    body: string | null
    title: string
    startAt: string | null
    endAt: string | null
    isEnabled: {
        labels: Array<string>
    }
    timeless: boolean
    isAnonymousParticipationAllowed: boolean
    metaDescription: string | null
    customCode: string | null
    debateType: DebateType
    debateContent: string
    stepDurationType?: {
        labels: Array<string>
    }
    articles: Array<Article>
}

const DEBATE_QUERY = graphql`
    query DebateStepFormQuery($stepId: ID!) {
        step: node(id: $stepId) {
            id
            ... on DebateStep {
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
              debateType
              debateContent
              debate {
                ...DebateWidgetIntegrationForm_debate
                ...FaceToFace_debate
                id
                articles {
                  edges {
                    node {
                      id 
                      url
                    }
                  }
                }
              }
              project {
                id
                title
                canEdit
                adminAlphaUrl
              }
            }
        }
        availableLocales(includeDisabled: false) {
            code
            isDefault
        }
    }
`;

export const StepDurationTypeEnum: Record<StepTypeDurationTypeUnion, StepTypeDurationTypeUnion> = {
    CUSTOM: 'CUSTOM',
    TIMELESS: 'TIMELESS',
} as const

export const EnabledEnum: Record<EnabledUnion, EnabledUnion> = {
    PUBLISHED: 'PUBLISHED',
    DRAFT: 'DRAFT',
} as const

const ParticipationTypeEnum: Record<ParticipationTypeUnion, ParticipationTypeUnion> = {
    WITH_ACCOUNT: 'WITH_ACCOUNT',
    WITHOUT_ACCOUNT: 'WITHOUT_ACCOUNT',
} as const

const DebateTypeEnum: Record<DebateType, DebateType> = {
    WYSIWYG: 'WYSIWYG',
    FACE_TO_FACE: 'FACE_TO_FACE',
} as const


const DebateStepForm: React.FC<Props> = ({stepId}) => {
    const intl = useIntl();
    const query = useLazyLoadQuery<DebateStepFormQuery>(DEBATE_QUERY, {
        stepId
    });

    const {setBreadCrumbItems} = useNavBarContext();

    const {step, availableLocales} = query;
    const project = step?.project;
    const debate = step?.debate;
    const defaultLocale = availableLocales.find(locale => locale.isDefault)?.code?.toLowerCase() ?? 'fr';

    const isEditing = !!step?.label;

    const getBreadCrumbItems = () => {
        const breadCrumbItems = [
            {
                title: project?.title ?? '',
                href: project?.adminAlphaUrl ?? ''
            },
            {
                title: intl.formatMessage({id: 'add-step'}),
                href: `/project/${project?.id}/create-step`,
            },
            {
                title: intl.formatMessage({id: 'debate-step'}),
                href: '',
            },
        ];
        if (isEditing) {
            return breadCrumbItems.filter(item => item.title !== intl.formatMessage({id: 'add-step'}));
        }
        return breadCrumbItems;
    }

    useEffect(() => {
        setBreadCrumbItems(getBreadCrumbItems());
        return () => setBreadCrumbItems([]);
    }, []);

    const getDefaultValues = (): FormValues => {
        const stepDurationType = step?.timeless ? [StepDurationTypeEnum.TIMELESS] : [StepDurationTypeEnum.CUSTOM];
        const isEnabled = step?.enabled ? [EnabledEnum.PUBLISHED] : [EnabledEnum.DRAFT];
        const articles = step?.debate?.articles?.edges?.map(edge => edge?.node)?.filter((article): article is Article => !!article) ?? [];

        return {
            id: stepId,
            label: step?.label ?? '',
            body: step?.body ?? '',
            title: step?.title ?? '',
            startAt: step?.timeRange?.startAt ?? null,
            endAt: step?.timeRange?.endAt ?? null,
            isEnabled: {
                labels: isEnabled
            },
            timeless: step?.timeless ?? false,
            stepDurationType: {
                labels: stepDurationType
            },
            isAnonymousParticipationAllowed: step?.isAnonymousParticipationAllowed ?? false,
            metaDescription: step?.metaDescription ?? '',
            customCode: step?.customCode ?? '',
            debateType: step?.debateType ?? DebateTypeEnum.WYSIWYG,
            debateContent: step?.debateContent ?? '',
            articles,
        }
    }

    const formMethods = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: getDefaultValues(),
    });

    const {handleSubmit, formState, control, watch, setValue, register} = formMethods;
    const {isSubmitting, isValid} = formState;

    const {fields: articles, append} = useFieldArray({
        control,
        name: 'articles',
    });

    const stepDurationType = watch('stepDurationType');
    const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM;

    const debateType = watch('debateType');
    const participationType = watch('isAnonymousParticipationAllowed') ? ParticipationTypeEnum.WITHOUT_ACCOUNT : ParticipationTypeEnum.WITH_ACCOUNT;

    const onSubmit = async (values: FormValues) => {
        const timeless = values?.stepDurationType?.labels?.[0] === StepDurationTypeEnum.TIMELESS ?? false;
        delete values.stepDurationType;
        const articles = values.articles.filter(article => !!article.url);

        const input: UpdateDebateStepInput = {
            ...values,
            isEnabled: values.isEnabled.labels?.[0] === EnabledEnum.PUBLISHED ?? false,
            timeless,
            articles,
        };

        try {
            const response = await UpdateDebateStepMutation.commit({input});
            const adminAlphaUrl = response.updateDebateStep?.debateStep?.project?.adminAlphaUrl;
            if (adminAlphaUrl) {
                return window.location.href = adminAlphaUrl
            }
        } catch (error) {
            return mutationErrorToast(intl);
        }
    }

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
            await DeleteStepMutation.commit({input: {stepId}})
            window.location.href = adminAlphaUrl;
        } catch (error) {
            return mutationErrorToast(intl);
        }
    }

    return (
        <Box bg="white" width="100%" p={6} borderRadius="8px">
            <Text fontWeight={600} color="blue.800" fontSize={4}>
                {intl.formatMessage({id: 'customize-your-debate-step'})}
            </Text>
            <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
                <FormControl name="label" control={control} isRequired mb={6}>
                    <FormLabel
                        htmlFor="label"
                        label={intl.formatMessage({id: 'step-label-name'})}
                    />
                    <FieldInput
                        id="label"
                        name="label"
                        control={control}
                        type="text"
                        placeholder={intl.formatMessage({id: 'step-label-name-placeholder'})}
                    />
                </FormControl>
                <FormControl name="title" control={control} isRequired mb={6}>
                    <FormLabel
                        htmlFor="title"
                        label={intl.formatMessage({id: 'debate.question'})}
                    />
                    <FieldInput
                        id="title"
                        name="title"
                        control={control}
                        type="text"
                        placeholder={intl.formatMessage({id: 'placeholderText.debat.questionLabel'})}
                    />
                </FormControl>

                <Tabs mb={6} selectedId={debateType} onChange={(selectedDebateType  ) => {
                    if (selectedDebateType !== debateType) {
                        setValue('debateType', selectedDebateType as DebateType)
                    }
                }}>
                    <Tabs.ButtonList ariaLabel="debateType">
                        <Tabs.Button id={DebateTypeEnum.WYSIWYG}>{intl.formatMessage({id: 'simple-debate'})}</Tabs.Button>
                        <Tabs.Button
                            id={DebateTypeEnum.FACE_TO_FACE}>{intl.formatMessage({id: 'debate-with-face-to-face'})}</Tabs.Button>
                    </Tabs.ButtonList>
                    <Tabs.PanelList>
                        <Tabs.Panel>
                            <FormProvider {...formMethods}>
                                <TextEditor
                                    name="debateContent"
                                    label={intl.formatMessage({id: 'debate-presentation'})}
                                    platformLanguage={defaultLocale}
                                    selectedLanguage={defaultLocale}
                                    buttonLabels={{
                                        submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
                                    }}
                                />
                            </FormProvider>
                        </Tabs.Panel>
                        <Tabs.Panel>
                            {debate && <FaceToFace debate={debate}/>}
                            <Box my={6} fontWeight={600}>
                                <Text mb={4}>{intl.formatMessage({id: 'related.articles'})}</Text>
                                {
                                    articles.map((article, index) => {
                                        return (
                                            <Box key={article.id} mb={4}>
                                                <FormLabel
                                                    fontWeight={400}
                                                    htmlFor={`articles.${index}.url`}
                                                    label={intl.formatMessage({id: 'article-link'})}
                                                />
                                                <Input type="text" {...register(`articles.${index}.url`)} />
                                            </Box>
                                        )
                                    })
                                }
                                <Button
                                    variant="tertiary"
                                    leftIcon={CapUIIcon.Add}
                                    onClick={() => {
                                        append({
                                            id: '',
                                            url: '',
                                        })
                                    }}
                                >
                                    {intl.formatMessage({id: 'add.article'})}
                                </Button>
                            </Box>
                        </Tabs.Panel>
                    </Tabs.PanelList>
                </Tabs>
                <FormControl name="stepDurationType" control={control} isRequired mb={6}>
                    <FormLabel
                        htmlFor="stepDurationType"
                        label={intl.formatMessage({id: 'step-duration'})}
                    />
                    <FieldInput
                        id="stepDurationType"
                        name="stepDurationType"
                        control={control}
                        type="radio"
                        choices={[
                            {
                                id: StepDurationTypeEnum.TIMELESS,
                                label: intl.formatMessage({id: 'timeless'}),
                                useIdAsValue: true,
                            },
                            {
                                id: StepDurationTypeEnum.CUSTOM,
                                label: intl.formatMessage({id: 'global.custom.feminine'}),
                                useIdAsValue: true,
                            }
                        ]}
                    />
                </FormControl>
                {
                    isCustomStepDuration && (
                        <Box color="gray.900" mt={6}>
                            <Flex>
                                <FormControl name="startAt" control={control} width="max-content" mr={6}>
                                    <FormLabel
                                        htmlFor="startAt"
                                        label={intl.formatMessage({id: 'start-date'})}
                                    >
                                        <Text fontSize={2} color="gray.500" >{intl.formatMessage({id: 'global.optional'})}</Text>
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
                                        label={intl.formatMessage({id: 'ending-date'})}
                                    >
                                        <Text fontSize={2} color="gray.500" >{intl.formatMessage({id: 'global.optional'})}</Text>
                                    </FormLabel>
                                    <FieldInput
                                        id="endAt"
                                        name="endAt"
                                        control={control}
                                        type="dateHour"
                                    />
                                </FormControl>
                            </Flex>
                        </Box>
                    )
                }
                <Box>
                    <Accordion color={CapUIAccordionColor.Transparent}>
                        <Accordion.Item id={intl.formatMessage({id: 'required-infos-to-participate'})}>
                            <Accordion.Button>{intl.formatMessage({id: 'required-infos-to-participate'})}</Accordion.Button>
                            <Accordion.Panel>
                                <Tabs selectedId={participationType} onChange={(selectedParticipationType) => {
                                    if (selectedParticipationType !== participationType) {
                                        const value = selectedParticipationType === 'WITHOUT_ACCOUNT';
                                        setValue('isAnonymousParticipationAllowed', value)
                                    }
                                }}>
                                    <Tabs.ButtonList
                                        ariaLabel={intl.formatMessage({id: 'required-infos-to-participate'})}>
                                        <Tabs.Button id={ParticipationTypeEnum.WITH_ACCOUNT} labelSx={{borderRadius: '0px'}}>
                                            {intl.formatMessage({id: 'with-account'})}
                                        </Tabs.Button>
                                        <Tabs.Button
                                            id={ParticipationTypeEnum.WITHOUT_ACCOUNT}>{intl.formatMessage({id: 'without-account'})}</Tabs.Button>
                                    </Tabs.ButtonList>
                                    <Tabs.PanelList>
                                        <Tabs.Panel bg="white">
                                        </Tabs.Panel>
                                        <Tabs.Panel>
                                            <Flex bg="white" p={4} justifyContent="space-between">
                                                <Text
                                                    fontWeight={600}>{intl.formatMessage({id: 'filling-argument-with-email'})}</Text>
                                                <Switch id="filling-argument-with-email" checked disabled/>
                                            </Flex>
                                        </Tabs.Panel>
                                    </Tabs.PanelList>
                                </Tabs>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                    {
                        (isEditing && debate) && (
                            <Accordion color={CapUIAccordionColor.Transparent}>
                                <Accordion.Item id={intl.formatMessage({id: 'integration-parameter'})}>
                                    <Accordion.Button>{intl.formatMessage({id: 'integration-parameter'})}</Accordion.Button>
                                    <Accordion.Panel>
                                        <DebateWidgetIntegrationForm debate={debate} />
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        )
                    }
                    <Accordion color={CapUIAccordionColor.Transparent}>
                        <Accordion.Item id={intl.formatMessage({id: 'optional-settings'})}>
                            <Accordion.Button>{intl.formatMessage({id: 'optional-settings'})}</Accordion.Button>
                            <Accordion.Panel>
                                <FormControl name="metaDescription" control={control}>
                                    <FormLabel
                                        htmlFor="metaDescription"
                                        label={intl.formatMessage({id: 'global.meta.description'})}
                                    />
                                    <FieldInput
                                        id="metaDescription"
                                        name="metaDescription"
                                        control={control}
                                        type="textarea"
                                    />
                                </FormControl>
                                <FormProvider {...formMethods}>
                                    <TextEditor
                                        name="customCode"
                                        label={intl.formatMessage({id: 'admin.customcode'})}
                                        platformLanguage={defaultLocale}
                                        selectedLanguage={defaultLocale}
                                        buttonLabels={{
                                            submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
                                        }}
                                    />
                                </FormProvider>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Box>
                <FormControl name="isEnabled" control={control} my={6}>
                    <FormLabel htmlFor="isEnabled"
                               label={intl.formatMessage({id: 'admin.fields.project.published_at'})}/>
                    <FieldInput
                        id="isEnabled"
                        name="isEnabled"
                        control={control}
                        type="radio"
                        choices={[
                            {
                                id: EnabledEnum.PUBLISHED,
                                label: intl.formatMessage({id: 'global.published'}),
                                useIdAsValue: true,
                            },
                            {
                                id: EnabledEnum.DRAFT,
                                label: intl.formatMessage({id: 'global-draft'}),
                                useIdAsValue: true,
                            }
                        ]}
                    />
                </FormControl>
                <Flex mt={6}>
                    <Button variantSize="big" variant="primary" type="submit"
                            mr={4} isLoading={isSubmitting} disabled={!isValid}
                    >
                        {isEditing ? intl.formatMessage({id: 'global.save'}) : intl.formatMessage({id: 'add-the-step'})}
                    </Button>
                    <Button variantSize="big" variant="secondary"
                            disabled={isSubmitting}
                            onClick={onBack}
                    >
                        {intl.formatMessage({id: 'global.back'})}
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

export default DebateStepForm;