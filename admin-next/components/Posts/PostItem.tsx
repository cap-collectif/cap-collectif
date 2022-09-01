import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import {
    ButtonQuickAction,
    CapUIIcon,
    CapUIIconSize,
    Flex,
    Link,
    Table,
    Text,
    Tooltip,
} from '@cap-collectif/ui';
import { PostItem_post$key } from '@relay/PostItem_post.graphql';
import PostListModalConfirmationDelete from './PostListModalConfirmationDelete';

export interface PostItemProps {
    post: PostItem_post$key;
    connectionName: string;
    isAdmin: boolean;
}

const FRAGMENT = graphql`
    fragment PostItem_post on Post {
        title
        adminUrl
        url
        authors {
            url
            username
        }
        isPublished
        updatedAt
        owner {
            username
        }
        relatedContent {
            __typename
            ... on Theme {
                title
                url
            }
            ... on Project {
                title
                url
            }
        }
        ...PostListModalConfirmationDelete_post
    }
`;
const PostItem: React.FC<PostItemProps> = ({ post: postFragment, connectionName, isAdmin }) => {
    const post = useFragment(FRAGMENT, postFragment);
    const intl = useIntl();

    const project = post.relatedContent.filter(content => content.__typename === 'Project')[0];

    const themes = post.relatedContent.filter(content => content.__typename === 'Theme');
    return (
        <React.Fragment>
            <Table.Td>
                {post.title && post.title?.split('').length > 128 ? (
                    <Tooltip
                        label={
                            <Text fontSize={1} lineHeight="sm">
                                {post.title}
                            </Text>
                        }>
                        <Link truncate={128} href={post.adminUrl}>
                            {post.title}
                        </Link>
                    </Tooltip>
                ) : (
                    <Link truncate={128} href={post.adminUrl}>
                        {post.title}
                    </Link>
                )}
            </Table.Td>
            {isAdmin && (
                <>
                    <Table.Td>
                        {post.authors.length > 0 && (
                            <Link href={post.authors[0].url}>{post.authors[0].username}</Link>
                        )}
                    </Table.Td>
                    <Table.Td>{post.owner?.username}</Table.Td>
                </>
            )}
            <Table.Td>
                <Flex direction="column">
                    {!!project && project.__typename === 'Project' && (
                        <Link href={project.url}>{project.title}</Link>
                    )}

                    <Flex direction="row" color="gray.500">
                        {themes.length > 0 &&
                            themes.map((theme, index) => {
                                if (theme && theme.__typename === 'Theme') {
                                    if (index + 1 < themes.length) {
                                        return (
                                            <React.Fragment key={theme.url}>
                                                <Link href={theme?.url} color="gray.500">
                                                    {theme?.title}
                                                </Link>
                                                <span>, &nbsp; </span>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <Link key={theme.url} href={theme?.url} color="gray.500">
                                            {theme?.title}
                                        </Link>
                                    );
                                }
                            })}
                    </Flex>
                </Flex>
            </Table.Td>
            <Table.Td>
                {post.isPublished
                    ? intl.formatMessage({ id: 'global.published' })
                    : intl.formatMessage({ id: 'global.no.published' })}
            </Table.Td>
            <Table.Td>
                {post.updatedAt &&
                    intl.formatDate(post.updatedAt, {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                    })}
            </Table.Td>
            <Table.Td visibleOnHover>
                <Flex direction="row" justify="space-evenly">
                    <ButtonQuickAction
                        icon={CapUIIcon.Preview}
                        size={CapUIIconSize.Md}
                        variantColor="blue"
                        label={intl.formatMessage({ id: 'global.preview' })}
                        onClick={() => window.open(post.url, '_self')}
                    />
                    <PostListModalConfirmationDelete post={post} connectionName={connectionName} />
                </Flex>
            </Table.Td>
        </React.Fragment>
    );
};

export default PostItem;
