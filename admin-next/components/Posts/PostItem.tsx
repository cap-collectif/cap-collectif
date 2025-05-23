import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import {
  ButtonQuickAction,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Link,
  Table,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import { PostItem_post$key } from '@relay/PostItem_post.graphql'
import { PostItem_viewer$key } from '@relay/PostItem_viewer.graphql'
import PostListModalConfirmationDelete from './PostListModalConfirmationDelete'

export interface PostItemProps {
  post: PostItem_post$key
  viewer: PostItem_viewer$key
  connectionName: string
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
    creator {
      id
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
`

const VIEWER_FRAGMENT = graphql`
  fragment PostItem_viewer on User {
    id
    isAdmin
    isAdminOrganization
    organizations {
      id
    }
  }
`

const PostItem: React.FC<PostItemProps> = ({ post: postFragment, viewer: viewerFragment, connectionName }) => {
  const post = useFragment(FRAGMENT, postFragment)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const { isAdmin, isAdminOrganization } = viewer
  const intl = useIntl()
  const viewerBelongsToAnOrganization = (viewer.organizations?.length ?? 0) > 0
  const canDelete = viewerBelongsToAnOrganization ? viewer?.isAdminOrganization || viewer.id === post.creator?.id : true
  const project = post.relatedContent.filter(content => content.__typename === 'Project')[0]

  const themes = post.relatedContent.filter(content => content.__typename === 'Theme')
  return (
    <React.Fragment>
      <Table.Td>
        {post.title && post.title?.split('').length > 128 ? (
          <Tooltip
            label={
              <Text fontSize={CapUIFontSize.Caption} lineHeight="sm">
                {post.title}
              </Text>
            }
          >
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
        <Table.Td>
          {post.authors.length > 0 && <Link href={post.authors[0].url}>{post.authors[0].username}</Link>}
        </Table.Td>
      )}
      {isAdmin || isAdminOrganization ? <Table.Td>{post.owner?.username}</Table.Td> : null}
      <Table.Td>{post.creator?.username}</Table.Td>
      <Table.Td>
        <Flex direction="column">
          {!!project && project.__typename === 'Project' && <Link href={project.url}>{project.title}</Link>}

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
                    )
                  }
                  return (
                    <Link key={theme.url} href={theme?.url} color="gray.500">
                      {theme?.title}
                    </Link>
                  )
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
        <Flex direction="row" justify="space-evenly" gap={2}>
          <ButtonQuickAction
            icon={CapUIIcon.Preview}
            size={CapUIIconSize.Md}
            variantColor="primary"
            label={intl.formatMessage({ id: 'global.preview' })}
            onClick={() => window.open(post.url, '_self')}
          />
          {canDelete ? <PostListModalConfirmationDelete post={post} connectionName={connectionName} /> : null}
        </Flex>
      </Table.Td>
    </React.Fragment>
  )
}

export default PostItem
