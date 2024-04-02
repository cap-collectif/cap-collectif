// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import type { ProjectArchiveFilter } from '~relay/ProjectsListQuery.graphql'

const ProjectsList = lazy(
  () =>
    import(
      /* webpackChunkName: "ProjectsList" */
      '~/components/Project/List/ProjectsList'
    ),
)
type Props = {
  limit?: number
  paginate?: boolean
  themeId?: string
  authorId?: string
  onlyPublic?: boolean
  archived?: ProjectArchiveFilter | null
}
export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={null}>
      <Providers designSystem>
        <ProjectsList {...props} />
      </Providers>
    </Suspense>
  )
}
