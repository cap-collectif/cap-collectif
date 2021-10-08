// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import ProjectListPage, {
  ProjectListPageQuery,
} from '~/components/Admin/Project/list/ProjectListPage';
import { PROJECT_LIST_PAGINATION } from '~/components/Admin/Project/list/ProjectList';

type Props = {|
  +isAdmin: boolean,
|};
const ProjectListQuery = ({ isAdmin }: Props) => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(ProjectListPageQuery);
  React.useEffect(() => {
    loadQuery({
      count: PROJECT_LIST_PAGINATION,
      cursor: null,
      term: null,
      affiliations: isAdmin ? null : ['OWNER'],
      orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
    });

    return () => {
      disposeQuery();
    };
  }, [disposeQuery, loadQuery, isAdmin]);
  return queryReference ? (
    <ProjectListPage queryReference={queryReference} isAdmin={isAdmin} />
  ) : null;
};

export default ProjectListQuery;
