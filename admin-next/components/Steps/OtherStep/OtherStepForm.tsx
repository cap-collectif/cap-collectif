import React, {useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {graphql, useLazyLoadQuery} from "react-relay";
import {OtherStepFormQuery} from "@relay/OtherStepFormQuery.graphql";
import {useNavBarContext} from "@components/NavBar/NavBar.context";
import {FormProvider, useForm} from "react-hook-form";
import {Accordion, Box, Button, CapUIAccordionColor, Flex, FormLabel, Text, toast} from "@cap-collectif/ui";
import {FieldInput, FormControl} from "@cap-collectif/form";
import TextEditor from "@components/Form/TextEditor/TextEditor";
import withPageAuthRequired from "@utils/withPageAuthRequired";
import UpdateOtherStepMutation from '@mutations/UpdateOtherStepMutation';
import {mutationErrorToast} from "@utils/mutation-error-toast";
import {onBack} from "@components/Steps/utils";

type Props = {
    stepId: string
};

type FormValues = {
    title: string
    label: string
    body: string
    startAt: string | null
    endAt: string | null
    isEnabled: {
        labels: Array<string>
    }
    metaDescription: string
    customCode: string | null
}

export const QUERY = graphql`
    query OtherStepFormQuery($stepId: ID!) {
        step: node(id: $stepId) {
            id
            ...on OtherStep {
                title
                label
                body
                timeRange {
                    startAt
                    endAt
                }
                enabled
                metaDescription
                customCode
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


const OtherStepForm: React.FC<Props> = ({ stepId}) => {
    const intl = useIntl();
    const query = useLazyLoadQuery<OtherStepFormQuery>(QUERY, {stepId});
    const {availableLocales, step} = query;
    const project = step?.project;
    const defaultLocale = availableLocales.find(locale => locale.isDefault);
    const {setBreadCrumbItems} = useNavBarContext();

    if (!project || !step) {
        throw new Error('Please provide a valid project and step');
    }

    if (!project.canEdit) {
        window.location.href = '/admin-next/projects';
    }

    const [isEditing, setIsEditing] = useState(() => {
        return !!step.label;
    });
    const getBreadCrumbItems = () => {
        const breadCrumbItems = [
            {
                title: project.title ?? '',
                href: project.adminAlphaUrl ?? ''
            },
            {
                title: intl.formatMessage({id: 'add-step'}),
                href: `/admin-next/project/${project.id}/create-step`,
            },
            {
                title: intl.formatMessage({id: 'custom-step'}),
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


    const getInitialValues = (): FormValues => {
        const isEnabledLabels = step.enabled ? ['published'] : ['draft'];
        return {
            title: step.title ?? '',
            label: step.label ?? '',
            body: step.body ?? '',
            startAt: step.timeRange?.startAt ?? null,
            endAt: step.timeRange?.endAt ?? null,
            isEnabled: {
                labels: isEnabledLabels,
            },
            metaDescription: step.metaDescription ?? '',
            customCode: step.customCode ?? '',
        }
    }

    const formMethods = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: getInitialValues(),
    });

    const {handleSubmit, formState, control} = formMethods;
    const {isSubmitting, isDirty, isValid} = formState;
    const onSubmit = async (values: FormValues) => {
        const input = {
            ...values,
            stepId,
            title: values.label, // since title is supposed to be merged within the description we set the title with the label instead until the API is changed
            startAt: values?.startAt,
            endAt: values?.endAt,
            isEnabled: values.isEnabled.labels?.[0] === 'published' ?? false,
        }

        try {
            const response = await UpdateOtherStepMutation.commit({input});
            if (!response.updateOtherStep) {
                return mutationErrorToast(intl);
            }
            setIsEditing(false);
            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'global.saved' }),
            })
        } catch (error) {
            return mutationErrorToast(intl);
        }
    };

    return (
        <Box bg="white" width="70%" p={6} borderRadius="8px">
            <Text fontWeight={600} color="blue.800" fontSize={4} mb={8}
            >
                {intl.formatMessage({id: 'customize-your-custom-step'})}
            </Text>
            <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
                <FormControl mb={6} name="label" control={control} isRequired>
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

                <FormProvider {...formMethods}>
                    <TextEditor
                        name="body"
                        label={intl.formatMessage({id: 'step-description'})}
                        platformLanguage={defaultLocale?.code}
                        selectedLanguage="fr"
                        buttonLabels={{
                            submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
                        }}
                    />
                </FormProvider>

                <Box color="gray.900" mt={6}>
                    <Text fontSize={2}>{intl.formatMessage({id: 'step-duration'})}</Text>
                    <Flex mb={4}>
                        <FormControl name="startAt" control={control} width="max-content" mr={6} mb={0}>
                            <FormLabel
                                htmlFor="startAt"
                                label={intl.formatMessage({id: 'start-date'})}
                            >
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
                                label={intl.formatMessage({id: 'ending-date'})}
                            >
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
                </Box>
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
                                    platformLanguage={defaultLocale?.code}
                                    selectedLanguage="fr"
                                    buttonLabels={{
                                        submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
                                    }}
                                />
                            </FormProvider>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>

                <FormControl name="isEnabled" control={control}>
                    <FormLabel htmlFor="isEnabled"
                               label={intl.formatMessage({id: 'admin.fields.project.published_at'})}/>
                    <FieldInput
                        id="isEnabled"
                        name="isEnabled"
                        control={control}
                        type="radio"
                        choices={[
                            {
                                id: 'published',
                                label: intl.formatMessage({ id: 'global.published' }),
                                useIdAsValue: true,
                            },
                            {
                                id: 'draft',
                                label: intl.formatMessage({ id: 'global-draft' }),
                                useIdAsValue: true,
                            }
                        ]}
                    />
                </FormControl>

                <Flex>
                    <Button variantSize="big" variant="primary" type="submit"
                            mr={4} isLoading={isSubmitting} disabled={!isDirty || !isValid}
                    >
                        {isEditing ? intl.formatMessage({id: 'global.edit'}) : intl.formatMessage({id: 'add-the-step'})}
                    </Button>
                    <Button variantSize="big" variant="secondary"
                            disabled={isSubmitting}
                            onClick={() => onBack(project?.adminAlphaUrl, isEditing, stepId, intl)}
                    >
                        {intl.formatMessage({id: 'global.back'})}
                    </Button>
                </Flex>
            </Box>
        </Box>
    )
}
export const getServerSideProps = withPageAuthRequired;
export default OtherStepForm;
