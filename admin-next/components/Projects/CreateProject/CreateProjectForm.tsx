import React, {useEffect} from 'react'
import {Box, Button, FormLabel, Text, toast} from "@cap-collectif/ui";
import {FieldInput, FormControl} from "@cap-collectif/form";
import {useForm} from "react-hook-form";
import {useIntl} from "react-intl";
import {graphql, useFragment} from "react-relay";
import UserListField from "../../Form/UserListField";
import formatSubmitted from "@utils/format-submitted";
import {mutationErrorToast} from "@utils/mutation-error-toast";
import CreateProjectMutation from "@mutations/CreateProjectMutation";
import {CreateProjectForm_viewer$key} from "@relay/CreateProjectForm_viewer.graphql";
import {useNavBarContext} from "../../NavBar/NavBar.context";
import {getParticipatoryBudgetInput} from "./ConfigureParticipatoryBudgetInput";
import PreConfigureProjectMutation from "@mutations/PreConfigureProjectMutation";
import {CreateProjectMutationResponse} from "@relay/CreateProjectMutation.graphql";
import {PreConfigureProjectMutationResponse} from "@relay/PreConfigureProjectMutation.graphql";

type ProjectModelType = 'PARTICIPATORY_BUDGET'

type Props = {
    viewer: CreateProjectForm_viewer$key,
    setShowHelpMessage: (showHelpMessage: boolean) => void
}

type ProjectResponse = { adminAlphaUrl: string }  | null | undefined;

type MutationResponse = CreateProjectMutationResponse | PreConfigureProjectMutationResponse | null;

type FormValues = {
    title: string
    authors: Array<{label: string, value: string}>
    model: ProjectModelType | null
}

const VIEWER_FRAGMENT = graphql`
    fragment CreateProjectForm_viewer on User {
        __typename
        id
        username
        isOnlyProjectAdmin
        isAdmin
        organizations {
            __typename
            id
            username
        }
    }
`;
const CreateProjectForm: React.FC<Props> = ({ viewer: viewerFragment, setShowHelpMessage }) => {
    const intl = useIntl();
    const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment);
    const {setSaving: triggerNavBarSaving, setBreadCrumbItems} = useNavBarContext();

    const { isOnlyProjectAdmin } = viewer;
    const organization = viewer?.organizations?.[0];
    const owner = organization ?? viewer;

    const modelOptions = [
        { value: 'PARTICIPATORY_BUDGET', label: intl.formatMessage({id: 'project.types.participatoryBudgeting'}) },
    ]

    const initialValues: FormValues = {
        title: '',
        authors: [{
            label: organization?.username ?? viewer.username ?? '',
            value: owner.id,
        }],
        model: null
    }

    const { handleSubmit, formState, control, watch } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: initialValues,
    });

    const { isValid, isSubmitting } = formState;

    const title = watch('title');
    const breadCrumbItems = [
        {
            title: intl.formatMessage({id: 'global.all.projects'}),
            href: '/projects'
        },
        {
            title: title || intl.formatMessage({ id: 'new-project' }),
            href: '/'
        },
    ];

    React.useEffect(() => {
        setBreadCrumbItems(breadCrumbItems)
        return () => setBreadCrumbItems([])
    }, [setBreadCrumbItems, title])

    useEffect(() => {
        triggerNavBarSaving(isSubmitting)
    }, [isSubmitting])

    const onSubmit = async (values: FormValues) => {

        const authors = formatSubmitted(values.authors);
        const title = values.title;

        let response: MutationResponse;
        let project: ProjectResponse;

        try {
            switch (values.model) {
                case "PARTICIPATORY_BUDGET":
                    const participatoryBudgetInput = getParticipatoryBudgetInput({
                        projectTitle: title,
                        authors,
                        intl
                    });

                    response = await PreConfigureProjectMutation.commit({
                        input: participatoryBudgetInput
                    });
                    project = response.preConfigureProject?.project;
                    break;
                default:
                    const input = {
                        title,
                        authors,
                        owner: owner.id
                    };
                    response = await CreateProjectMutation.commit(
                        { input, connections: [] }
                    )
                    project = response?.createProject?.project;
            }
        } catch {
            return mutationErrorToast(intl);
        }

        if (!project) return mutationErrorToast(intl);

        toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'project-successfully-created' }),
        });

        const adminUrl = project.adminAlphaUrl;
        if (adminUrl) {
            window.location.href = adminUrl;
        }
    }

    return (
        <Box width="50%">
            <Text color="blue.900" fontSize={5} fontWeight={600}
                  mb={4}>{intl.formatMessage({id: 'customize-your-new-project'})}</Text>
            <Text color="blue.900" fontSize={4}
                  fontWeight={400}>{intl.formatMessage({id: 'create-project-help-text'})}
            </Text>
            <Box mt={5} as="form" maxWidth="437px" onSubmit={handleSubmit(onSubmit)}>
                <FormControl name="title" control={control}  isRequired>
                    <FormLabel
                        htmlFor="title"
                        label={intl.formatMessage({id: 'global.project.name'})}
                    />
                    <FieldInput
                        id="title"
                        name="title"
                        control={control}
                        type="text"
                        onFocus={() => {
                            setShowHelpMessage(true);
                        }}
                        onBlur={() => {
                            // TODO : uncomment when onBlur is handled by the input
                            // setShowHelpMessage(false);
                        }}
                    />
                </FormControl>
                <FormControl
                    name="authors"
                    control={control}
                    isRequired
                    isDisabled={isOnlyProjectAdmin || !!organization}
                >
                    <FormLabel
                        htmlFor="authors"
                        label={intl.formatMessage({id: 'project.owner'})}
                    />
                    <UserListField name="authors" control={control} isMulti/>
                </FormControl>
                <FormControl name="model" control={control}>
                    <FormLabel
                        htmlFor="model"
                        label={intl.formatMessage({id: 'global.model'})}
                    />
                    <FieldInput
                        name="model"
                        control={control}
                        options={modelOptions}
                        type="select"
                        clearable
                        placeholder={intl.formatMessage({
                            id: 'global.model',
                        })}
                    />
                </FormControl>
                <Button
                    mt={5}
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    mr={8}
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!isValid}
                >
                    {intl.formatMessage({id: 'lets-go'})}
                </Button>
            </Box>
        </Box>
    )
}

export default CreateProjectForm