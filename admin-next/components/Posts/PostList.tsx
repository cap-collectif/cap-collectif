import * as React from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Button, CapUIIcon, Icon, Menu, Table, Text } from '@cap-collectif/ui';
import EmptyMessage from 'components/UI/Table/EmptyMessage';
import { PostList_viewer$key } from '@relay/PostList_viewer.graphql';
import { PostList_postOwner$key } from '@relay/PostList_postOwner.graphql';
import PostItem from './PostItem';
import { useLayoutContext } from 'components/Layout/Layout.context';

export const POST_LIST_PAGINATION = 20;

export const PostListQuery = graphql`
    fragment PostList_postOwner on PostOwner
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

const VIEWER_FRAGMENT = graphql`
    fragment PostList_viewer on User {
        isAdmin
        isAdminOrganization
        ...PostItem_viewer
    }
`;

export interface PostListProps {
    viewer: PostList_viewer$key;
    postOwner: PostList_postOwner$key;
    term: string;
    resetTerm: () => void;
}

const PostList: React.FC<PostListProps> = ({ viewer: viewerRef, postOwner, term, resetTerm }) => {
    const intl = useIntl();
    const viewer = useFragment(VIEWER_FRAGMENT, viewerRef);
    const { isAdmin, isAdminOrganization } = viewer;
    const { data, loadNext, hasNext, refetch } = usePaginationFragment(PostListQuery, postOwner);
    const [orderBy, setOrderBy] = React.useState('DESC');
    const { posts } = data;
    const firstRendered = React.useRef<true | null>(null);
    const hasPosts = posts ? posts.totalCount > 0 : false;
    const { contentRef } = useLayoutContext();

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
            emptyMessage={
                <EmptyMessage
                    onReset={() => {
                        setOrderBy('DESC');
                        resetTerm();
                    }}
                />
            }
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
                    {isAdmin ? (
                        <Table.Th>
                            <Text lineHeight="sm">
                                {intl.formatMessage({ id: 'global.authors' })}
                            </Text>
                        </Table.Th>
                    ) : null}
                    {isAdmin || isAdminOrganization ? (
                        <Table.Th>{intl.formatMessage({ id: 'global.owner' })}</Table.Th>
                    ) : null}
                    <Table.Th>
                        <Text lineHeight="sm">
                            {intl.formatMessage({ id: 'admin.projects.list.author' })}
                        </Text>
                    </Table.Th>
                    <Table.Th>
                        <Text lineHeight="sm">
                            {intl.formatMessage({ id: 'global.participative.project' })}
                        </Text>
                    </Table.Th>
                    <Table.Th>
                        <Text lineHeight="sm">
                            {intl.formatMessage({ id: 'global.publication' })}
                        </Text>
                    </Table.Th>
                    <Table.Th>
                        {({ styles }) => (
                            <Menu
                                disclosure={
                                    <Button
                                        variant="tertiary"
                                        variantColor="hierarchy"
                                        rightIcon={
                                            orderBy === 'DESC'
                                                ? CapUIIcon.ArrowDownO
                                                : CapUIIcon.ArrowUpO
                                        }
                                        {...styles}>
                                        <Text lineHeight="sm" style={{ whiteSpace: 'nowrap' }}>
                                            {intl.formatMessage({ id: 'global.update' })}
                                        </Text>
                                    </Button>
                                }>
                                <Menu.List>
                                    <Menu.OptionGroup
                                        value={orderBy}
                                        onChange={setOrderBy}
                                        type="radio"
                                        title={intl.formatMessage({ id: 'sort-by' })}>
                                        <Menu.OptionItem value="DESC">
                                            <Text>
                                                {intl.formatMessage({ id: 'global.filter_last' })}
                                            </Text>
                                            <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
                                        </Menu.OptionItem>

                                        <Menu.OptionItem value="ASC">
                                            <Text>
                                                {intl.formatMessage({ id: 'global.filter_old' })}
                                            </Text>
                                            <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
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
                scrollParentRef={contentRef || undefined}
                hasMore={hasNext}>
                {posts?.edges
                    ?.filter(Boolean)
                    .map(edge => edge?.node)
                    .filter(Boolean)
                    .map(
                        post =>
                            post && (
                                <Table.Tr key={post.id} rowId={post.id}>
                                    <PostItem
                                        post={post}
                                        connectionName={posts.__id}
                                        viewer={viewer}
                                    />
                                </Table.Tr>
                            ),
                    )}
            </Table.Tbody>
        </Table>
    );
};

export default PostList;
