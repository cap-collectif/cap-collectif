// @flow
import * as React from 'react';
import {
  graphql,
  type GraphQLTaggedNode,
  type PreloadedQuery,
  usePreloadedQuery,
} from 'react-relay';
import { useIntl } from 'react-intl';
import { type PostListPageQuery as PostListPageQueryType } from '~relay/PostListPageQuery.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Input from '~ui/Form/Input/Input';
import PostList from '~/components/Admin/Post/PostList/PostList';
import TablePlaceholder from '~ds/Table/placeholder';
import Button from '~ds/Button/Button';
import PostPostListNoResult from '~/components/Admin/Post/PostList/PostPostListNoResult';

type Props = {|
  +queryReference: PreloadedQuery<PostListPageQueryType>,
  +isAdmin: boolean,
|};

export const PostListPageQuery: GraphQLTaggedNode = graphql`
  query PostListPageQuery(
    $count: Int
    $cursor: String
    $term: String
    $affiliations: [PostAffiliation!]
  ) {
    viewer {
      id
      allposts: posts(affiliations: $affiliations) {
        totalCount
      }
      ...PostList_viewer
        @arguments(count: $count, cursor: $cursor, term: $term, affiliations: $affiliations)
    }
  }
`;

const PostListPage = ({ queryReference, isAdmin }: Props): React.Node => {
  const intl = useIntl();
  const [term, setTerm] = React.useState<string>('');
  const query = usePreloadedQuery<PostListPageQueryType>(PostListPageQuery, queryReference);
  return (
    <Flex direction="column" spacing={6}>
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'global.articles' })}
      </Text>

      {query.viewer.allposts.totalCount > 0 ? (
        <Flex
          direction="column"
          p={8}
          spacing={4}
          m={6}
          bg="white"
          borderRadius="normal"
          overflow="hidden">
          <Flex direction="row">
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="small"
              leftIcon="ADD"
              onClick={() => window.open('/admin/capco/app/post/create', '_self')}
              mr={8}>
              {intl.formatMessage({ id: 'admin-create-post' })}
            </Button>
            <Input
              type="text"
              name="term"
              id="search-post"
              onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
              value={term}
              placeholder={intl.formatMessage({ id: 'search-article' })}
            />
          </Flex>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={6} />}>
            <PostList
              viewer={query.viewer}
              term={term}
              isAdmin={isAdmin}
              resetTerm={() => setTerm('')}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <PostPostListNoResult />
      )}
    </Flex>
  );
};

export default PostListPage;
