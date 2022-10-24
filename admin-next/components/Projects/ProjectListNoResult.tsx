import * as React from 'react';
import { useIntl } from 'react-intl';
import { Heading, Flex, Text, SpotIcon, CapUISpotIcon, CapUISpotIconSize } from '@cap-collectif/ui';
import type { ProjectModalCreateProject_query$key } from '@relay/ProjectModalCreateProject_query.graphql';
import ProjectModalCreateProject from './ProjectModalCreateProject';
import { graphql, useFragment } from 'react-relay';
import { ProjectListNoResult_viewer$key } from '@relay/ProjectListNoResult_viewer.graphql';

export interface ProjectListNoResultProps {
    orderBy: string;
    term: string;
    query: ProjectModalCreateProject_query$key;
    viewer: ProjectListNoResult_viewer$key;
    hasProjects: boolean;
}

const VIEWER_FRAGMENT = graphql`
    fragment ProjectListNoResult_viewer on User {
        ...ProjectModalCreateProject_viewer
    }
`;
const ProjectListNoResult: React.FC<ProjectListNoResultProps> = ({
    query,
    viewer: viewerRef,
    orderBy,
    term,
    hasProjects,
}) => {
    const intl = useIntl();
    const viewer = useFragment(VIEWER_FRAGMENT, viewerRef);

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
                    orderBy={orderBy}
                    term={term}
                    query={query}
                    viewer={viewer}
                    noResult
                    hasProjects={hasProjects}
                />
            </Flex>
        </Flex>
    );
};

export default ProjectListNoResult;
