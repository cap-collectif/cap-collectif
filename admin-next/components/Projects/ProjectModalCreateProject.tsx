import * as React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import {
    Button,
    Modal,
    Heading,
    ButtonGroup,
    Flex,
    toast,
    CapUIIcon,
    CapUIModalSize,
} from '@cap-collectif/ui';
import type { ProjectModalCreateProject_query$key } from '@relay/ProjectModalCreateProject_query.graphql';
import { mutationErrorToast } from 'utils/mutation-error-toast';
import formatSubmitted from 'utils/format-submitted';
import CreateProjectMutation from 'mutations/CreateProjectMutation';
import { useForm } from 'react-hook-form';
import FieldInput from 'components/Form/FieldInput';
import UserListField from 'components/Form/UserListField';

const formName = 'form-create-project';

export type Author = { value: string; label: string | null };

type FormValues = {
    title: string;
    author?: Author | Array<Author>;
    type?: string;
};

interface ProjectModalCreateProjectProps {
    viewerId: string;
    isAdmin: boolean;
    isOnlyProjectAdmin?: boolean;
    orderBy: string;
    term: string;
    query: null | ProjectModalCreateProject_query$key;
    initialValues: FormValues;
    noResult?: boolean;
    hasProjects: boolean;
}

const FRAGMENT = graphql`
    fragment ProjectModalCreateProject_query on Query {
        projectTypes {
            id
            title
        }
    }
`;

const ProjectModalCreateProject: React.FC<ProjectModalCreateProjectProps> = ({
    query: queryReference,
    noResult,
    isOnlyProjectAdmin,
    viewerId,
    term,
    isAdmin,
    orderBy,
    hasProjects,
    initialValues,
}) => {
    const intl = useIntl();
    const data = useFragment(FRAGMENT, queryReference);

    const { handleSubmit, formState, control, reset } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: initialValues,
    });
    const { isValid, isSubmitting } = formState;
    const onSubmit = (values: FormValues) => {
        const input = {
            projectType: values.type,
            title: values.title,
            authors: formatSubmitted(values.author),
        };
        const owner = values.author
            ? Array.isArray(values.author)
                ? values.author[0]
                : values.author
            : null;
        return CreateProjectMutation.commit(
            {
                input,
                connections: [
                    ConnectionHandler.getConnectionID(viewerId, 'ProjectList_projects', {
                        query: term || null,
                        affiliations: isAdmin ? null : ['OWNER'],
                        orderBy: { field: 'PUBLISHED_AT', direction: orderBy },
                    }),
                ],
            },
            isAdmin,
            hasProjects,
            owner,
        )
            .then(response => {
                if (!response.createProject?.project) {
                    return mutationErrorToast(intl);
                }
                const adminUrl = response.createProject?.project.adminAlphaUrl;
                if (!hasProjects && adminUrl) {
                    reset();
                    window.location.href = adminUrl;
                }
                toast({
                    variant: 'success',
                    content: intl.formatMessage({ id: 'project-successfully-created' }),
                });
                reset();
            })
            .catch(() => mutationErrorToast(intl));
    };
    return (
        <Modal
            ariaLabel={intl.formatMessage({ id: 'create-a-project' })}
            size={CapUIModalSize.Lg}
            disclosure={
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize={noResult ? 'big' : 'small'}
                    leftIcon={CapUIIcon.Add}
                    mr={8}>
                    {intl.formatMessage({ id: 'create-a-project' })}
                </Button>
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>{intl.formatMessage({ id: 'create-a-project' })}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Flex as="form" direction="column" spacing={3} id={formName}>
                            <FieldInput
                                id="title"
                                name="title"
                                required
                                label={intl.formatMessage({ id: 'global.title' })}
                                placeholder={intl.formatMessage({
                                    id: 'admiun.project.create.title.placeholder',
                                })}
                                control={control}
                                type="text"
                            />
                            <UserListField
                                defaultOptions
                                name="author"
                                id="author"
                                disabled={isOnlyProjectAdmin}
                                aria-autocomplete="list"
                                aria-haspopup="true"
                                role="combobox"
                                label={intl.formatMessage({ id: 'global.author' })}
                                isMulti
                                control={control}
                            />

                            <FieldInput
                                name="type"
                                id="type"
                                label={intl.formatMessage({
                                    id: 'admin.fields.project.type.title',
                                })}
                                control={control}
                                disabled={false}
                                placeholder={intl.formatMessage({
                                    id: 'admin.fields.menu_item.parent_empty',
                                })}
                                type="select"
                                options={data?.projectTypes?.filter(Boolean).map(type => ({
                                    value: type.id,
                                    label: intl.formatMessage({ id: type.title }),
                                }))}
                            />
                        </Flex>
                    </Modal.Body>
                    <Modal.Footer spacing={2}>
                        <ButtonGroup>
                            <Button
                                variantSize="medium"
                                variant="secondary"
                                variantColor="hierarchy"
                                onClick={hide}>
                                {intl.formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                                onClick={e => {
                                    handleSubmit((data: FormValues) => onSubmit(data))(e);
                                    hide();
                                }}
                                isLoading={isSubmitting}
                                disabled={!isValid}
                                variantSize="medium"
                                variant="primary"
                                variantColor="primary">
                                {intl.formatMessage({ id: 'global.create' })}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};
export default ProjectModalCreateProject;
