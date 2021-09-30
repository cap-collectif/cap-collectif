// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import type { PostItem_post$key } from '~relay/PostItem_post.graphql';
import Td from '~ds/Table/Td';
import Link from '~ds/Link/Link';
import Tooltip from '~ds/Tooltip/Tooltip';
import Text from '~ui/Primitives/Text';
import Flex from '~ui/Primitives/Layout/Flex';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import colors from '~/styles/modules/colors';
import PostPostListModalConfirmationDelete from '~/components/Admin/Post/PostList/PostPostListModalConfirmationDelete';
import Table from '~ds/Table';

type Props = {|
  +post: PostItem_post$key,
  +connectionName: string,
  +isAdmin: boolean,
|};

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
    ...PostPostListModalConfirmationDelete_post
  }
`;
const PostItem = ({ post: postFragment, connectionName, isAdmin }: Props): React.Node => {
  const post = useFragment(FRAGMENT, postFragment);
  const intl = useIntl();
  const themes = post.relatedContent.filter(content => content.__typename === 'Theme');
  const project = post.relatedContent.filter(content => content.__typename === 'Project')[0];
  return (
    <React.Fragment>
      <Td>
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
      </Td>
      <Td>
        {post.authors.length > 0 && (
          <Link href={post.authors[0].url}>{post.authors[0].username}</Link>
        )}
      </Td>
      {isAdmin && <Table.Td>{post.owner?.username}</Table.Td>}
      <Td>
        <Flex direction="column">
          {project && project.title && project.url && (
            <Link href={project.url}>{project.title}</Link>
          )}
          <Flex direction="row" color="gray.500">
            {themes.length > 0 &&
              themes.map((theme, index) => {
                if (theme && theme.title && theme.url) {
                  if (index + 1 < themes.length) {
                    return (
                      <React.Fragment key={theme.url}>
                        <Link href={theme?.url} color={`${colors.gray['500']}!important`}>
                          {theme?.title}
                        </Link>
                        <span>, &nbsp; </span>
                      </React.Fragment>
                    );
                  }
                  return (
                    <Link
                      key={theme.url}
                      href={theme?.url}
                      color={`${colors.gray['500']}!important`}>
                      {theme?.title}
                    </Link>
                  );
                }
              })}
          </Flex>
        </Flex>
      </Td>
      <Td>
        {post.isPublished
          ? intl.formatMessage({ id: 'global.published' })
          : intl.formatMessage({ id: 'global.no.published' })}
      </Td>
      <Td>
        {post.updatedAt &&
          intl.formatDate(post.updatedAt, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
      </Td>
      <Td visibleOnHover>
        <Flex direction="row" justify="space-evenly">
          <ButtonQuickAction
            icon="PREVIEW"
            size="md"
            variantColor="primary"
            label={intl.formatMessage({ id: 'global.preview' })}
            onClick={() => window.open(post.url, '_self')}
          />
          <PostPostListModalConfirmationDelete post={post} connectionName={connectionName} />
        </Flex>
      </Td>
    </React.Fragment>
  );
};

export default PostItem;
