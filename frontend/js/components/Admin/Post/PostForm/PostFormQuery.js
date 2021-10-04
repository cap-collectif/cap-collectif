// @flow
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import PostFormPage, { PostFormPageQuery } from '~/components/Admin/Post/PostForm/PostFormPage';

type Props = {|
  +postId: string,
  +isAdmin: boolean,
  +proposalId: string,
|};

const PostFormQuery = ({ isAdmin, postId, proposalId }: Props): React.Node => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader(PostFormPageQuery);
  React.useEffect(() => {
    loadQuery({
      postId,
      affiliations: isAdmin ? null : ['OWNER'],
      isAdmin,
      proposalId: proposalId || 'null',
      hasProposal: !!proposalId,
    });

    return () => {
      disposeQuery();
    };
  }, [disposeQuery, loadQuery, isAdmin, postId, proposalId]);
  return queryReference ? (
    <PostFormPage
      postId={postId}
      queryReference={queryReference}
      isAdmin={isAdmin}
      proposalId={proposalId}
    />
  ) : null;
};

export default PostFormQuery;
