'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import {
  ProjectPagePostsTab_project$data,
  ProjectPagePostsTab_project$key,
} from '@relay/ProjectPagePostsTab_project.graphql'
import {
  Box,
  CapUIIcon,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  CardTagLabel,
  CardTagLeftIcon,
  CardTagList,
  CardTag,
  Grid,
} from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'

const FRAGMENT = graphql`
  fragment ProjectPagePostsTab_project on Project {
    posts(first: 100) {
      edges {
        node {
          id
          title
          url
          publishedAt
          abstract
          themes {
            id
            title
          }
          media {
            url
          }
        }
      }
    }
  }
`

type Props = {
  project: ProjectPagePostsTab_project$key
}

type PostNode = NonNullable<NonNullable<ProjectPagePostsTab_project$data['posts']['edges']>[number]>['node']

const PostCard: React.FC<{ post: PostNode }> = ({ post }) => {
  const date = post.publishedAt
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(post.publishedAt),
      )
    : null

  return (
    <Card format="vertical">
      <CardCover>
        {post.media?.url ? (
          <CardCoverImage src={post.media.url} />
        ) : (
          <CardCoverPlaceholder icon={CapUIIcon.FileO} color="primary.base" />
        )}
      </CardCover>
      <CardContent primaryInfo={post.title ?? ''} href={post.url} secondaryInfo={post.abstract}>
        <CardTagList>
          {date && (
            <CardTag>
              <CardTagLeftIcon name={CapUIIcon.CalendarO} />
              <CardTagLabel>{date}</CardTagLabel>
            </CardTag>
          )}
          {post.themes.map(theme => (
            <CardTag key={theme.id}>
              <CardTagLeftIcon name={CapUIIcon.FolderO} />
              <CardTagLabel>{theme.title}</CardTagLabel>
            </CardTag>
          ))}
        </CardTagList>
      </CardContent>
    </Card>
  )
}

const ProjectPagePostsTab: React.FC<Props> = ({ project: projectRef }) => {
  const data = useFragment(FRAGMENT, projectRef)
  const posts = data.posts.edges?.flatMap(edge => (edge?.node ? [edge.node] : [])) ?? []

  return (
    <Box maxWidth={pxToRem(1280)} mx="auto" px={['md', 'lg']} py="xl">
      <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap="lg">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </Grid>
    </Box>
  )
}

export default ProjectPagePostsTab
