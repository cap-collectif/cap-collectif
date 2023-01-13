import * as React from 'react';
import { useIntl } from 'react-intl';
import {Heading, Flex, Text, SpotIcon, CapUISpotIcon, CapUISpotIconSize, CapUIIcon, Button} from '@cap-collectif/ui';
import type { ProjectModalCreateProject_query$key } from '@relay/ProjectModalCreateProject_query.graphql';
import ProjectModalCreateProject from './ProjectModalCreateProject';
import { graphql, useFragment } from 'react-relay';
import { ProjectListNoResult_viewer$key } from '@relay/ProjectListNoResult_viewer.graphql';
import useFeatureFlag from "@hooks/useFeatureFlag";

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
    const isNewProjectCreateEnabled = useFeatureFlag('unstable__new_create_project');
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
                {isNewProjectCreateEnabled ?
                    <Button
                        as="a"
                        href="/admin-next/create-project"
                        variant="primary"
                        variantColor="primary"
                        variantSize="big"
                        leftIcon={CapUIIcon.Add}
                        mr={8}
                    >
                        {intl.formatMessage({ id: 'create-a-project' })}
                    </Button>
                    :
                    <ProjectModalCreateProject
                        orderBy={orderBy}
                        term={term}
                        viewer={viewer}
                        query={query}
                        noResult={true}
                        hasProjects={hasProjects}
                    />
                }
            </Flex>
        </Flex>
    );
};

export default ProjectListNoResult;
