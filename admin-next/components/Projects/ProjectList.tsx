import * as React from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { ProjectList_viewer$key } from '@relay/ProjectList_viewer.graphql';
import { Text, Table, Menu, Icon, CapUIIcon } from '@cap-collectif/ui';
import ProjectItem from 'components/Projects/ProjectItem';
import EmptyMessage from 'components/UI/Table/EmptyMessage';

export const PROJECT_LIST_PAGINATION = 20;

export const ProjectListQuery = graphql`
    fragment ProjectList_viewer on User
    @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        term: { type: "String", defaultValue: null }
        affiliations: { type: "[ProjectAffiliation!]" }
        orderBy: { type: "ProjectOwnerProjectOrder" }
    )
    @refetchable(queryName: "ProjectListPaginationQuery") {
        projects(
            first: $count
            after: $cursor
            query: $term
            affiliations: $affiliations
            orderBy: $orderBy
        ) @connection(key: "ProjectList_projects", filters: ["query", "orderBy", "affiliations"]) {
            __id
            totalCount
            edges {
                node {
                    id
                    ...ProjectItem_project
                }
            }
        }
    }
`;

interface ProjectListProps {
    viewer: ProjectList_viewer$key;
    term: string;
    orderBy: string;
    isAdmin: boolean;
    isSuperAdmin?: boolean;
    isOnlyProjectAdmin?: boolean;
    resetTerm: () => void;
    setOrderBy: (orderBy: 'DESC' | 'ASC') => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
    viewer,
    term,
    isAdmin,
    resetTerm,
    orderBy,
    setOrderBy,
    isSuperAdmin,
    isOnlyProjectAdmin,
}) => {
    const intl = useIntl();
    const { data, loadNext, hasNext, refetch } = usePaginationFragment(ProjectListQuery, viewer);
    const { projects } = data;
    const firstRendered = React.useRef<true | null>(null);
    const hasProjects = projects ? projects.totalCount > 0 : false;
    React.useEffect(() => {
        if (firstRendered.current) {
            refetch({
                term: term || null,
                affiliations: isAdmin ? null : ['OWNER'],
                orderBy: { field: 'PUBLISHED_AT', direction: orderBy },
            });
        }
        firstRendered.current = true;
    }, [term, isAdmin, refetch, orderBy]);
    return (
        <Table
            emptyMessage={
                <EmptyMessage
                    onReset={() => {
                        setOrderBy('DESC');
                        resetTerm();
                    }}
                />
            }>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>
                        <Text lineHeight="sm">
                            {intl.formatMessage({ id: 'admin.fields.proposal.project' })}
                        </Text>
                    </Table.Th>
                    {isAdmin && (
                        <Table.Th>
                            <Text lineHeight="sm">
                                {intl.formatMessage({ id: 'admin.projects.list.author' })}
                            </Text>
                        </Table.Th>
                    )}
                    <Table.Th>
                        <Text lineHeight="sm">
                            {intl.formatMessage({ id: 'admin.settings.header.access' })}
                        </Text>
                    </Table.Th>
                    <Table.Th>
                        <Table.Menu label={intl.formatMessage({ id: 'global.publication' })}>
                            <Table.Menu.OptionGroup
                                value={orderBy}
                                onChange={value => {
                                    if (value === 'DESC' || value === 'ASC') setOrderBy(value);
                                }}
                                type="radio"
                                title={intl.formatMessage({ id: 'sort-by' })}>
                                <Menu.OptionItem value="DESC">
                                    <Text>{intl.formatMessage({ id: 'global.filter_last' })}</Text>
                                    <Icon ml="auto" name={CapUIIcon.ArrowDownO} />
                                </Menu.OptionItem>
                                <Menu.OptionItem value="ASC">
                                    <Text>{intl.formatMessage({ id: 'global.filter_old' })}</Text>
                                    <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
                                </Menu.OptionItem>
                            </Table.Menu.OptionGroup>
                        </Table.Menu>
                    </Table.Th>
                    <Table.Th />
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody
                useInfiniteScroll={hasProjects}
                onScrollToBottom={() => {
                    loadNext(PROJECT_LIST_PAGINATION);
                }}
                hasMore={hasNext}>
                {projects?.edges
                    ?.filter(Boolean)
                    .map(edge => edge?.node)
                    .filter(Boolean)
                    .map(
                        project =>
                            project && (
                                <Table.Tr key={project.id} rowId={project.id}>
                                    <ProjectItem
                                        project={project}
                                        connectionName={projects.__id}
                                        isSuperAdmin={isSuperAdmin}
                                        isAdmin={isAdmin}
                                        isOnlyProjectAdmin={isOnlyProjectAdmin}
                                    />
                                </Table.Tr>
                            ),
                    )}
            </Table.Tbody>
        </Table>
    );
};

export default ProjectList;
