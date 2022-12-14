import React, {useEffect} from 'react'
import {Box, Button, FormLabel, Text, toast} from "@cap-collectif/ui";
import {FieldInput, FormControl} from "@cap-collectif/form";
import {useForm} from "react-hook-form";
import {useIntl} from "react-intl";
import {graphql, useFragment} from "react-relay";
import UserListField from "../../Form/UserListField";
import {CreateProjectForm_query$key} from "@relay/CreateProjectForm_query.graphql";
import formatSubmitted from "@utils/format-submitted";
import {mutationErrorToast} from "@utils/mutation-error-toast";
import CreateProjectMutation from "@mutations/CreateProjectMutation";
import {CreateProjectForm_viewer$key} from "@relay/CreateProjectForm_viewer.graphql";
import {useNavBarContext} from "../../NavBar/NavBar.context";



type Props = {
    query: CreateProjectForm_query$key,
    viewer: CreateProjectForm_viewer$key,
    setShowHelpMessage: (showHelpMessage: boolean) => void
}

type FormValues = {
    title: string
    authors: Array<{label: string, value: string}>
    type: string
}


const QUERY_FRAGMENT = graphql`
    fragment CreateProjectForm_query on Query {
        projectTypes {
            id
            title
        }
    }
`;

const VIEWER_FRAGMENT = graphql`
    fragment CreateProjectForm_viewer on User {
        id
        username
        isOnlyProjectAdmin
        organizations {
            id
            displayName
        }
    }
`;
const CreateProjectForm: React.FC<Props> = ({ query: queryFragment, viewer: viewerFragment, setShowHelpMessage }) => {
    const intl = useIntl();
    const query = useFragment(QUERY_FRAGMENT, queryFragment);
    const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment);
    const {setSaving: triggerNavBarSaving, setBreadCrumbItems} = useNavBarContext();

    const { isOnlyProjectAdmin } = viewer;
    const organization = viewer?.organizations?.[0];
    const owner = organization ?? viewer;

    const projectTypeOptions = query?.projectTypes?.filter(Boolean).map(type => ({
        value: type.id,
        label: intl.formatMessage({id: type.title}),
    })) ?? []

    const initialValues: FormValues = {
        title: '',
        authors: [{
            label: organization?.displayName ?? viewer.username ?? '',
            value: owner.id,
        }],
        type: ''
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
    }, [setBreadCrumbItems, title])

    useEffect(() => {
        triggerNavBarSaving(isSubmitting)
    }, [isSubmitting])

    const onSubmit = async (values: FormValues) => {

        const input = {
            projectType: values.type,
            title: values.title,
            authors: formatSubmitted(values.authors),
            owner: owner.id
        };

        try {
            const response = await CreateProjectMutation.commit(
                { input, connections: [] }
            )
            if (!response.createProject?.project) {
                return mutationErrorToast(intl);
            }
            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'project-successfully-created' }),
            });
            const adminUrl = response.createProject?.project.adminAlphaUrl;
            if (adminUrl) {
                window.location.href = adminUrl;
            }
        } catch (error) {
            mutationErrorToast(intl)
        }
    };

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
                {/*<FormControl name="type" control={control}>*/}
                {/*    <FormLabel*/}
                {/*        htmlFor="type"*/}
                {/*        label={intl.formatMessage({id: 'global.type'})}*/}
                {/*    />*/}
                {/*    <FieldInput*/}
                {/*        name="type"*/}
                {/*        control={control}*/}
                {/*        options={projectTypeOptions}*/}
                {/*        type="select"*/}
                {/*        placeholder={intl.formatMessage({*/}
                {/*            id: 'global.type',*/}
                {/*        })}*/}
                {/*    />*/}
                {/*</FormControl>*/}
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