import * as React from 'react'
import { Skeleton } from '@cap-collectif/ui'
import ProjectHeader from '~ui/Project/ProjectHeader'
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery'

type Props = {
  hasError: boolean
  fetchData: (() => void) | null | undefined
}

const ProjectHeaderPlaceholder = ({ hasError, fetchData }: Props): JSX.Element => {
  return (
    <ProjectHeader>
      <ProjectHeader.Cover isArchived={false}>
        {hasError && <ErrorQuery retry={fetchData} />}
        <ProjectHeader.Content>
          <Skeleton.Circle size={9} />
          <ProjectHeader.Title>
            <Skeleton.Text size="sm" width="90%" />
          </ProjectHeader.Title>
          <ProjectHeader.Blocks>
            <Skeleton.Text width="20%" />
            <Skeleton.Text width="20%" />
            <Skeleton.Text width="20%" />
            <Skeleton.Text width="20%" />
          </ProjectHeader.Blocks>
          <ProjectHeader.Info>
            <Skeleton.Text width="48%" />
            <Skeleton.Text width="48%" />
          </ProjectHeader.Info>
          <ProjectHeader.Socials>
            <Skeleton.Circle size={4} />
            <Skeleton.Circle size={4} />
            <Skeleton.Circle size={4} />
          </ProjectHeader.Socials>
        </ProjectHeader.Content>
      </ProjectHeader.Cover>
      <ProjectHeader.Frise>
        <Skeleton.Text width="100%" height="56px" />
      </ProjectHeader.Frise>
    </ProjectHeader>
  )
}

export default ProjectHeaderPlaceholder
