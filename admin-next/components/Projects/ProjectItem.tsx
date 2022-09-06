import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';
import {
    toast,
    Table,
    Link,
    Text,
    Flex,
    ButtonQuickAction,
    Menu,
    Tag,
    CapUIIcon,
    CapUIIconSize,
} from '@cap-collectif/ui';
import type {
    ProjectItem_project,
    ProjectItem_project$key,
} from '@relay/ProjectItem_project.graphql';
import ProjectModalConfirmationDelete from 'components/Projects/ProjectModalConfirmationDelete';
import ProjectModalExportSteps from 'components/Projects/ProjectModalExportSteps';
import DuplicateProjectMutation from 'mutations/DuplicateProjectMutation';
import { mutationErrorToast } from 'utils/mutation-error-toast';

interface ProjectItemProps {
    project: ProjectItem_project$key;
    connectionName: string;
    isSuperAdmin?: boolean;
    isOnlyProjectAdmin?: boolean;
    isAdmin?: boolean;
    isAdminOrganization?: boolean;
}

const FRAGMENT = graphql`
    fragment ProjectItem_project on Project {
        id
        title
        themes {
            id
            title
            url
        }
        owner {
            __typename
            id
            username
            url
        }
        creator {
            __typename
            id
            username
            url
        }
        visibility
        publishedAt
        url
        adminAlphaUrl
        exportContributorsUrl
        exportableSteps {
            id
        }
        ...ProjectModalConfirmationDelete_project
        ...ProjectModalExportSteps_project
    }
`;

const onDuplicate = (
    intl: IntlShape,
    duplicatedProject: ProjectItem_project,
    connectionName: string,
) => {
    const input = {
        id: duplicatedProject.id,
    };
    DuplicateProjectMutation.commit(
        {
            input,
            connections: [connectionName],
        },
        duplicatedProject,
        intl,
    )
        .then(() =>
            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'project.successfully.duplicated' }),
            }),
        )
        .catch(() => mutationErrorToast(intl));
};
const ProjectItem: React.FC<ProjectItemProps> = ({
    project: projectFragment,
    connectionName,
    isSuperAdmin,
    isOnlyProjectAdmin,
    isAdmin,
    isAdminOrganization,
}) => {
    const project = useFragment(FRAGMENT, projectFragment);
    const intl = useIntl();

    return (
        <React.Fragment>
            <Table.Td>
                <Flex direction="column">
                    {project && project.title && project.adminAlphaUrl && (
                        <Link truncate={128} href={project.adminAlphaUrl}>
                            {project.title}
                        </Link>
                    )}
                    <Flex direction="row" color="gray.500">
                        {!!project?.themes &&
                            !!project?.themes?.length &&
                            project?.themes?.length > 0 &&
                            project?.themes?.map((theme, index) => {
                                if (theme && theme.title && theme.url && project?.themes?.length) {
                                    if (index + 1 < project?.themes?.length) {
                                        return (
                                            <React.Fragment key={theme.url}>
                                                <Link href={theme?.url} color="gray.500">
                                                    {theme?.title}
                                                </Link>
                                                <span>, &nbsp; </span>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <Link key={theme.url} href={theme?.url} color="gray.500">
                                            {theme?.title}
                                        </Link>
                                    );
                                }
                            })}
                    </Flex>
                </Flex>
            </Table.Td>
            {isAdmin && (
                <Table.Td>
                    {project?.creator?.url && (
                        <Link key={project?.creator?.id} href={project?.creator?.url}>
                            {project?.creator?.username}
                        </Link>
                    )}
                </Table.Td>
            )}
            {isAdmin || isAdminOrganization ? (
                <Table.Td>
                    {project?.owner?.url && (
                        <Link key={project?.owner?.id} href={project?.owner?.url}>
                            {project?.owner?.username}
                        </Link>
                    )}
                </Table.Td>
            ) : null}
            <Table.Td>
                {project.visibility === 'PUBLIC' && (
                    <Tag variantColor="green">{intl.formatMessage({ id: 'public-everybody' })}</Tag>
                )}
                {project.visibility === 'CUSTOM' && (
                    <Tag variantColor="aqua">{intl.formatMessage({ id: 'global.customized' })}</Tag>
                )}
                {(project.visibility === 'ME' || project.visibility === 'ADMIN') && (
                    <Tag variantColor="gray">{intl.formatMessage({ id: 'private' })}</Tag>
                )}
            </Table.Td>

            <Table.Td>
                {project.publishedAt &&
                    intl.formatDate(project.publishedAt, {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                    })}
            </Table.Td>
            <Table.Td visibleOnHover>
                <Menu
                    disclosure={
                        <ButtonQuickAction
                            icon={CapUIIcon.More}
                            size={CapUIIconSize.Md}
                            variantColor="blue"
                            label={intl.formatMessage({ id: 'global.plus' })}
                        />
                    }>
                    <Menu.List>
                        <Menu.Item onClick={() => window.open(project.url, '_self')}>
                            <Text> {intl.formatMessage({ id: 'action_show' })} </Text>
                        </Menu.Item>
                        {(!!project.exportContributorsUrl ||
                            (!!project.exportableSteps && project.exportableSteps.length > 0)) && (
                            <ProjectModalExportSteps
                                project={project}
                                isOnlyProjectAdmin={isOnlyProjectAdmin}
                            />
                        )}
                        {isSuperAdmin && (
                            <Menu.Item
                                onClick={() => {
                                    onDuplicate(intl, project, connectionName);
                                }}>
                                <Text> {intl.formatMessage({ id: 'duplicate' })} </Text>
                            </Menu.Item>
                        )}
                        <ProjectModalConfirmationDelete
                            project={project}
                            connectionName={connectionName}
                        />
                    </Menu.List>
                </Menu>
            </Table.Td>
        </React.Fragment>
    );
};

export default ProjectItem;
