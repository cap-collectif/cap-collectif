import * as React from 'react';
import { NextPage } from 'next';
import debounce from 'utils/debounce-promise';
import { graphql, useQueryLoader, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import type {
    projectsQuery as projectsQueryType,
    OrderDirection,
} from '@relay/projectsQuery.graphql';
import { Flex, Search, Spinner, CapUIIconSize } from '@cap-collectif/ui';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import { useIntl } from 'react-intl';
import ProjectListNoResult from 'components/Projects/ProjectListNoResult';
import ProjectModalCreateProject from 'components/Projects/ProjectModalCreateProject';
import TablePlaceholder from 'components/UI/Table/TablePlaceholder';
import ProjectList from 'components/Projects/ProjectList';

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
            id
            username
            isOnlyProjectAdmin
            isSuperAdmin
            allProjects: projects(affiliations: $affiliations) {
                totalCount
            }
            ...ProjectList_viewer
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
    isAdmin: boolean;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ isAdmin, queryReference }) => {
    const intl = useIntl();
    const [term, setTerm] = React.useState('');
    const [orderBy, setOrderBy] = React.useState<OrderDirection>('DESC');
    const query = usePreloadedQuery<projectsQueryType>(projectsQuery, queryReference);
    const modalInitialValues = {
        title: '',
        author: {
            value: query.viewer.id,
            label: query.viewer.username,
        },
    };
    const hasProjects = query.viewer.allProjects.totalCount > 0;

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
                        <ProjectModalCreateProject
                            viewerId={query.viewer.id}
                            isAdmin={isAdmin}
                            orderBy={orderBy}
                            term={term}
                            query={query}
                            initialValues={modalInitialValues}
                            isOnlyProjectAdmin={query.viewer.isOnlyProjectAdmin}
                            noResult={false}
                            hasProjects={hasProjects}
                        />
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
                            viewer={query.viewer}
                            term={term}
                            isAdmin={isAdmin}
                            resetTerm={() => setTerm('')}
                            isSuperAdmin={query.viewer.isSuperAdmin}
                            isOnlyProjectAdmin={query.viewer.isOnlyProjectAdmin}
                        />
                    </React.Suspense>
                </Flex>
            ) : (
                <ProjectListNoResult
                    term={term}
                    orderBy={orderBy}
                    isAdmin={isAdmin}
                    modalInitialValues={modalInitialValues}
                    query={query}
                    viewerId={query.viewer.id}
                    isOnlyProjectAdmin={query.viewer.isOnlyProjectAdmin}
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
                        isAdmin={viewerSession.isAdmin}
                    />
                </React.Suspense>
            ) : null}
        </Layout>
    );
};

export default Projects;
