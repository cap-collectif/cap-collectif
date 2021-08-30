// @flow
import * as React from 'react';
import { graphql, type GraphQLTaggedNode, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import type { PostList_viewer$key } from '~relay/PostList_viewer.graphql';
import Table from '~ds/Table';
import Tr from '~ds/Table/Tr';
import PostItem from '~/components/Admin/Post/PostList/PostItem';
import Menu from '../../../DesignSystem/Menu/Menu';
import Button from '~ds/Button/Button';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';
import colors from '~/styles/modules/colors';

export const POST_LIST_PAGINATION = 20;

export const PostListQuery: GraphQLTaggedNode = graphql`
  fragment PostList_viewer on User
    @argumentDefinitions(
      count: { type: "Int!" }
      cursor: { type: "String" }
      term: { type: "String", defaultValue: null }
      affiliations: { type: "[PostAffiliation!]" }
      orderBy: { type: "PostOrder" }
    )
    @refetchable(queryName: "PostListPaginationQuery") {
    posts(
      first: $count
      after: $cursor
      query: $term
      affiliations: $affiliations
      orderBy: $orderBy
    ) @connection(key: "PostList_posts", filters: ["query", "orderBy"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...PostItem_post
        }
      }
    }
  }
`;
type Props = {|
  +viewer: PostList_viewer$key,
  +term: string,
  +isAdmin: boolean,
  +resetTerm: () => void,
|};

const PostList = ({ viewer, term, isAdmin, resetTerm }: Props): React.Node => {
  const intl = useIntl();
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(PostListQuery, viewer);
  const [orderBy, setOrderBy] = React.useState('DESC');
  const { posts } = data;
  const firstRendered = React.useRef(null);
  const hasPosts = posts ? posts.totalCount > 0 : false;

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        term: term || null,
        affiliations: isAdmin ? null : ['OWNER'],
        orderBy: { field: 'UPDATED_AT', direction: orderBy },
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
            <Text lineHeight="sm">{intl.formatMessage({ id: 'global.title' })}</Text>
          </Table.Th>
          <Table.Th>
            <Text lineHeight="sm">{intl.formatMessage({ id: 'global.authors' })}</Text>
          </Table.Th>
          <Table.Th>
            <Text lineHeight="sm">
              {intl.formatMessage({ id: 'global.participative.project' })}
            </Text>
          </Table.Th>
          <Table.Th>
            <Text lineHeight="sm">{intl.formatMessage({ id: 'global.publication' })}</Text>
          </Table.Th>
          <Table.Th>
            {({ styles }) => (
              <Menu>
                <Menu.Button as={React.Fragment}>
                  <Button
                    rightIcon={orderBy === 'DESC' ? ICON_NAME.ARROW_DOWN_O : ICON_NAME.ARROW_UP_O}
                    {...styles}>
                    <Text lineHeight="sm" style={{ whiteSpace: 'nowrap' }}>
                      {intl.formatMessage({ id: 'global.update' })}
                    </Text>
                  </Button>
                </Menu.Button>
                <Menu.List>
                  <Menu.OptionGroup
                    value={orderBy}
                    onChange={setOrderBy}
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
        useInfiniteScroll={hasPosts}
        onScrollToBottom={() => {
          loadNext(POST_LIST_PAGINATION);
        }}
        hasMore={hasNext}>
        {posts?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(post => (
            <Tr
              key={post.id}
              rowId={post.id}
              css={css({
                a: { textDecoration: 'none ', color: colors.gray['900'] },
                '&:hover a': { textDecoration: 'underline' },
                '&:hover button': { opacity: '1 !important' },
                'a:hover': { color: `${colors.blue['500']}!important` },
              })}>
              <PostItem post={post} connectionName={posts.__id} />
            </Tr>
          ))}
      </Table.Tbody>
    </Table>
  );
};

export default PostList;
