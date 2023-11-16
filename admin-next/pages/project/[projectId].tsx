import * as React from 'react';
import { NextPage } from 'next';
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { PageProps } from '../../types';
import Layout from '../../components/Layout/Layout';
import withPageAuthRequired from '@utils/withPageAuthRequired';
import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { ProjectIdQuery } from '@relay/ProjectIdQuery.graphql';
import ProjectConfigForm from '../../components/Projects/ProjectConfig/ProjectConfigForm';

export interface ProjectConfigPageProps {
    projectId: string;
}

export const QUERY = graphql`
    query ProjectIdQuery($id: ID!) {
        node(id: $id) {
            id
            ...on Project {
                canEdit
            }
            ...ProjectConfigForm_project
        }
    }
`;

const ProjectConfigPage: React.FC<ProjectConfigPageProps> = ({ projectId }) => {
    const response = useLazyLoadQuery<ProjectIdQuery>(QUERY, { id: projectId });
    const project = response.node;

    if (!project || !project?.canEdit) {
        window.location.href = '/admin-next/projects';
        return null;
    }

    return <ProjectConfigForm project={project} />;
};

const ProjectConfig: NextPage<PageProps> = ({ viewerSession }) => {
    const intl = useIntl();
    const router = useRouter();
    const { projectId } = router.query;
    if (projectId) {
        return (
            <Layout navTitle={intl.formatMessage({ id: 'global.all.projects' })}>
                <React.Suspense
                    fallback={
                        <Flex alignItems="center" justifyContent="center">
                            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                        </Flex>
                    }>
                    <ProjectConfigPage projectId={String(projectId)} />
                </React.Suspense>
            </Layout>
        );
    }
    return null;
};

export const getServerSideProps = withPageAuthRequired;

export default ProjectConfig;
