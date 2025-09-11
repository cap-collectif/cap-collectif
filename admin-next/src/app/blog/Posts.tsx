'use client'

import PageHeading from '@components/FrontOffice/PageHeading/PageHeading'
import { FC, Suspense, useEffect } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { evalCustomCode } from 'src/app/custom-code'
import { PostsListQuery, OrderDirection } from '@relay/PostsListQuery.graphql'
import { Spinner } from '@cap-collectif/ui'
import useUrlState from '@hooks/useUrlState'
import PostListSection from '@components/FrontOffice/Sections/PostList/PostListSection'

type Props = {
  title: string
  body: string
  customCode?: string
  pagination?: number
}

const projectsQuery = graphql`
  query PostsListQuery($count: Int, $orderBy: PostOrder, $theme: ID, $project: ID) {
    ...PostListSection_query @arguments(count: $count, orderBy: $orderBy, theme: $theme, project: $project)
  }
`

export const PostsRender: FC<{ pagination?: number }> = ({ pagination }) => {
  const [orderBy, setOrderBy] = useUrlState('orderBy', '')
  const [theme, setTheme] = useUrlState('theme', '')
  const [project, setProject] = useUrlState('project', '')
  const orderByFilter: OrderDirection = ['ASC', 'DESC'].includes(orderBy)
    ? (orderBy as OrderDirection)
    : ('DESC' as OrderDirection)

  const count = pagination || 20

  const query = useLazyLoadQuery<PostsListQuery>(projectsQuery, {
    count,
    orderBy: { direction: orderByFilter, field: 'PUBLISHED_AT' },
    theme,
    project,
  })

  return (
    <PostListSection
      query={query}
      orderBy={orderByFilter}
      setOrderBy={setOrderBy}
      theme={theme}
      setTheme={setTheme}
      project={project}
      setProject={setProject}
      count={count}
    />
  )
}

export const Posts: FC<Props> = ({ title, body, customCode, pagination }) => {
  useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

  return (
    <>
      <PageHeading title={title} subtitle={body} />
      <Suspense fallback={<Spinner m="auto" my="10rem" />}>
        <PostsRender pagination={pagination} />
      </Suspense>
    </>
  )
}

export default Posts
