import * as React from 'react';
import { NextPage } from 'next';
import debounce from 'utils/debounce-promise';
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import type {
    projectsQuery as projectsQueryType,
    OrderDirection,
} from '@relay/projectsQuery.graphql';
import {Flex, Search, Spinner, CapUIIconSize, CapUIIcon, Button} from '@cap-collectif/ui';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';
import ProjectListNoResult from 'components/Projects/ProjectListNoResult';
import ProjectModalCreateProject from 'components/Projects/ProjectModalCreateProject';
import TablePlaceholder from 'components/UI/Table/TablePlaceholder';
import ProjectList from 'components/Projects/ProjectList';
import withPageAuthRequired from '../utils/withPageAuthRequired';
import useFeatureFlag from "@hooks/useFeatureFlag";

export const projectsQuery = graphql`
    query projectsQuery(
        $count: Int
        $cursor: String
        $term: String
        $affiliations: [ProjectAffiliation!]
        $orderBy: ProjectOwnerProjectOrder
    ) {
        ...ProjectModalCreateProject_query
        viewer {
            allProjects: projects(affiliations: $affiliations) {
                totalCount
            }
            organizations {
                allProjects: projects(affiliations: $affiliations) {
                    totalCount
                }
                ...ProjectList_projectOwner
                    @arguments(
                        count: $count
                        cursor: $cursor
                        term: $term
                        affiliations: $affiliations
                        orderBy: $orderBy
                    )
            }
            ...ProjectList_viewer
            ...ProjectModalCreateProject_viewer
            ...ProjectListNoResult_viewer
            ...ProjectList_projectOwner
                @arguments(
                    count: $count
                    cursor: $cursor
                    term: $term
                    affiliations: $affiliations
                    orderBy: $orderBy
                )
        }
    }
`;

export const PROJECT_LIST_PAGINATION = 20;

export interface ProjectListPageProps {
    queryReference: PreloadedQuery<projectsQueryType>;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ queryReference }) => {
    const intl = useIntl();
    const [term, setTerm] = React.useState('');
    const [orderBy, setOrderBy] = React.useState<OrderDirection>('DESC');
    const isNewProjectCreateEnabled = useFeatureFlag('unstable__new_create_project');
    const query = usePreloadedQuery<projectsQueryType>(projectsQuery, queryReference);
    const { viewer } = query;
    const organization = viewer.organizations?.[0];
    const hasProjects =
        viewer.allProjects.totalCount > 0 || (organization?.allProjects?.totalCount ?? 0) > 0;
    const onTermChange = debounce((value: string) => setTerm(value), 400);

    return (
        <Flex direction="column" spacing={6}>
            {hasProjects ? (
                <Flex
                    direction="column"
                    p={8}
                    spacing={4}
                    m={6}
                    bg="white"
                    borderRadius="normal"
                    overflow="hidden">
                    <Flex direction="row">
                        {isNewProjectCreateEnabled ?
                            <Button
                                as="a"
                                href="/admin-next/createProject"
                                variant="primary"
                                variantColor="primary"
                                variantSize="small"
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
                                noResult={false}
                                hasProjects={hasProjects}
                            />
                        }
                        <Search
                            id="search-post"
                            onChange={onTermChange}
                            value={term}
                            placeholder={intl.formatMessage({ id: 'search-project' })}
                        />
                    </Flex>
                    <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={6} />}>
                        <ProjectList
                            orderBy={orderBy}
                            setOrderBy={setOrderBy}
                            term={term}
                            resetTerm={() => setTerm('')}
                            projectOwner={organization ?? viewer}
                            viewer={viewer}
                        />
                    </React.Suspense>
                </Flex>
            ) : (
                <ProjectListNoResult
                    term={term}
                    orderBy={orderBy}
                    viewer={viewer}
                    query={query}
                    hasProjects={hasProjects}
                />
            )}
        </Flex>
    );
};

const Projects: NextPage<PageProps> = ({ viewerSession }) => {
    const intl = useIntl();
    const [queryReference, loadQuery, disposeQuery] =
        useQueryLoader<projectsQueryType>(projectsQuery);
    React.useEffect(() => {
        loadQuery({
            count: PROJECT_LIST_PAGINATION,
            cursor: null,
            term: null,
            affiliations: viewerSession.isAdmin ? null : ['OWNER'],
            orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        });

        return () => {
            disposeQuery();
        };
    }, [disposeQuery, loadQuery, viewerSession.isAdmin]);
    return (
        <Layout navTitle={intl.formatMessage({ id: 'global.all.projects' })}>
            {queryReference ? (
                <React.Suspense
                    fallback={
                        <Flex alignItems="center" justifyContent="center">
                            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                        </Flex>
                    }>
                    <ProjectListPage
                        queryReference={queryReference}
                    />
                </React.Suspense>
            ) : null}
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default Projects;
