// @flow
import * as React from 'react';
import {
  graphql,
  type GraphQLTaggedNode,
  type PreloadedQuery,
  usePreloadedQuery,
} from 'react-relay';
import { useIntl } from 'react-intl';
import { type ProjectListPageQuery as ProjectListPageQueryType } from '~relay/ProjectListPageQuery.graphql';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Flex from '~ui/Primitives/Layout/Flex';
import Input from '~ui/Form/Input/Input';
import TablePlaceholder from '~ds/Table/placeholder';
import ProjectList from '~/components/Admin/Project/list/ProjectList';
import ProjectModalCreateProject from '~/components/Admin/Project/list/ProjectModalCreateProject';
import ProjectListNoResult from '~/components/Admin/Project/list/ProjectListNoResult';

type Props = {|
  +queryReference: PreloadedQuery<ProjectListPageQueryType>,
  +isAdmin: boolean,
|};

export const ProjectListPageQuery: GraphQLTaggedNode = graphql`
  query ProjectListPageQuery(
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

const ProjectListPage = ({ queryReference, isAdmin }: Props): React.Node => {
  const intl = useIntl();
  const [term, setTerm] = React.useState<string>('');
  const [orderBy, setOrderBy] = React.useState('DESC');
  const query = usePreloadedQuery<ProjectListPageQueryType>(ProjectListPageQuery, queryReference);
  const modalInitialValues = {
    title: '',
    author: {
      value: query.viewer.id,
      label: query.viewer.username,
    },
  };
  const hasProjects = query.viewer.allProjects.totalCount > 0;
  return (
    <Flex direction="column" spacing={6}>
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'global.all.projects' })}
      </Text>

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
              intl={intl}
              isAdmin={isAdmin}
              orderBy={orderBy}
              term={term}
              query={query}
              initialValues={modalInitialValues}
              isOnlyProjectAdmin={query.viewer.isOnlyProjectAdmin}
              noResult={false}
              hasProjects={hasProjects}
            />
            <Input
              type="text"
              name="term"
              id="search-post"
              onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
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

export default ProjectListPage;
