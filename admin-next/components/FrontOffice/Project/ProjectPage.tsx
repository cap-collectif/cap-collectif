'use client'

import * as React from 'react'
import { Spinner } from '@cap-collectif/ui'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { ProjectPageQuery } from '@relay/ProjectPageQuery.graphql'
import ProjectPageLayout from './ProjectPageLayout'

const QUERY = graphql`
  query ProjectPageQuery($projectSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        ...ProjectPageLayout_project
      }
    }
  }
`

type Props = {
  projectSlug: string
}

const ProjectPageRender: React.FC<Props> = ({ projectSlug }) => {
  const data = useLazyLoadQuery<ProjectPageQuery>(QUERY, { projectSlug })

  if (!data.project) return null

  return <ProjectPageLayout project={data.project} />
}

const ProjectPage: React.FC<Props> = ({ projectSlug }) => {
  return (
    <React.Suspense fallback={<Spinner m="auto" my="10rem" />}>
      <ProjectPageRender projectSlug={projectSlug} />
    </React.Suspense>
  )
}

export default ProjectPage
