import * as React from 'react';
import { useIntl } from 'react-intl';
import { Heading, Flex, Text, SpotIcon, CapUISpotIcon, CapUISpotIconSize } from '@cap-collectif/ui';
import type { ProjectModalCreateProject_query$key } from '@relay/ProjectModalCreateProject_query.graphql';
import ProjectModalCreateProject, { Author } from './ProjectModalCreateProject';

export interface ProjectListNoResultProps {
    viewerId: string;
    isAdmin: boolean;
    orderBy: string;
    term: string;
    query: ProjectModalCreateProject_query$key;
    modalInitialValues: {
        title: string;
        author?: Author;
        type?: string;
    };
    isOnlyProjectAdmin: boolean;
    hasProjects: boolean;
}

const ProjectListNoResult: React.FC<ProjectListNoResultProps> = ({
    query,
    isAdmin,
    orderBy,
    term,
    modalInitialValues,
    viewerId,
    isOnlyProjectAdmin,
    hasProjects,
}) => {
    const intl = useIntl();

    return (
        <Flex
            direction="row"
            spacing={8}
            bg="white"
            py="96px"
            px="111px"
            mt={6}
            mx={6}
            borderRadius="normal">
            <SpotIcon name={CapUISpotIcon.PROJECT} size={CapUISpotIconSize.Lg} />
            <Flex direction="column" color="blue.900" align="flex-start" width="300px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: 'publish.first.project' })}
                </Heading>
                <Text mb={8}>{intl.formatMessage({ id: 'project.first.description' })}</Text>
                <ProjectModalCreateProject
                    viewerId={viewerId}
                    isAdmin={isAdmin}
                    orderBy={orderBy}
                    term={term}
                    query={query}
                    initialValues={modalInitialValues}
                    isOnlyProjectAdmin={isOnlyProjectAdmin}
                    noResult
                    hasProjects={hasProjects}
                />
            </Flex>
        </Flex>
    );
};

export default ProjectListNoResult;
