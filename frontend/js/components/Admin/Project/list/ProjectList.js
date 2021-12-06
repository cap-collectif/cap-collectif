// @flow
import * as React from 'react';
import { graphql, type GraphQLTaggedNode, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import type { ProjectList_viewer$key } from '~relay/ProjectList_viewer.graphql';
import Table from '~ds/Table';
import Tr from '~ds/Table/Tr';
import Menu from '../../../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';
import colors from '~/styles/modules/colors';
import ProjectItem from '~/components/Admin/Project/list/ProjectItem';

export const PROJECT_LIST_PAGINATION = 20;

export const ProjectListQuery: GraphQLTaggedNode = graphql`
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
type Props = {|
  +viewer: ProjectList_viewer$key,
  +term: string,
  +orderBy: string,
  +isAdmin: boolean,
  +isSuperAdmin?: boolean,
  +isOnlyProjectAdmin?: boolean,
  +resetTerm: () => void,
  +setOrderBy: (orderBy: string) => void,
|};

const ProjectList = ({
  viewer,
  term,
  isAdmin,
  resetTerm,
  orderBy,
  setOrderBy,
  isSuperAdmin,
  isOnlyProjectAdmin,
}: Props): React.Node => {
  const intl = useIntl();
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(ProjectListQuery, viewer);
  const { projects } = data;
  const firstRendered = React.useRef(null);
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
      style={{ border: 'none' }}
      onReset={() => {
        setOrderBy('DESC');
        resetTerm();
      }}>
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
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button
                    rightIcon={orderBy === 'DESC' ? ICON_NAME.ARROW_DOWN_O : ICON_NAME.ARROW_UP_O}
                    {...styles}>
                    <Text lineHeight="sm" style={{ whiteSpace: 'nowrap' }}>
                      {intl.formatMessage({ id: 'global.publication' })}
                    </Text>
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={orderBy}
                    onChange={value => setOrderBy(((value: any): string))}
                    type="radio"
                    title={intl.formatMessage({ id: 'sort-by' })}>
                    <Menu.OptionItem value="DESC">
                      <Text>{intl.formatMessage({ id: 'global.filter_last' })}</Text>
                      <Icon ml="auto" name="ARROW_DOWN_O" />
                    </Menu.OptionItem>

                    <Menu.OptionItem value="ASC">
                      <Text>{intl.formatMessage({ id: 'global.filter_old' })}</Text>
                      <Icon ml="auto" name="ARROW_UP_O" />
                    </Menu.OptionItem>
                  </Menu.OptionGroup>
                </Menu.List>
              </Menu>
            )}
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
          .map(edge => edge.node)
          .filter(Boolean)
          .map(project => (
            <Tr
              key={project.id}
              rowId={project.id}
              css={css({
                a: { textDecoration: 'none ', color: colors.gray['900'] },
                '&:hover a': { textDecoration: 'underline' },
                '&:hover button': { opacity: '1 !important' },
                'a:hover': { color: `${colors.blue['500']}!important` },
              })}>
              <ProjectItem
                project={project}
                connectionName={projects.__id}
                isSuperAdmin={isSuperAdmin}
                isAdmin={isAdmin}
                isOnlyProjectAdmin={isOnlyProjectAdmin}
              />
            </Tr>
          ))}
      </Table.Tbody>
    </Table>
  );
};

export default ProjectList;
