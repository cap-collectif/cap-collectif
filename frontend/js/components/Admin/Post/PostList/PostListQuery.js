// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import PostListPage, { PostListPageQuery } from '~/components/Admin/Post/PostList/PostListPage';
import { POST_LIST_PAGINATION } from './PostList';

type Props = {|
  +isAdmin: boolean,
|};

const PostListQuery = ({ isAdmin }: Props): React.Node => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(PostListPageQuery);
  React.useEffect(() => {
    loadQuery({
      count: POST_LIST_PAGINATION,
      cursor: null,
      term: null,
      affiliations: isAdmin ? null : ['OWNER'],
      orderBy: { field: 'CREATED_AT', direction: 'DESC' },
    });

    return () => {
      disposeQuery();
    };
  }, [disposeQuery, loadQuery, isAdmin]);
  return queryReference ? <PostListPage queryReference={queryReference} isAdmin={isAdmin} /> : null;
};

export default PostListQuery;
