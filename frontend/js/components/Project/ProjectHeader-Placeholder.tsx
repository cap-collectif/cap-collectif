import { Box, Skeleton } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import * as React from 'react'
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery'
import ProjectHeader from '~ui/Project/ProjectHeader'

type Props = {
  hasError: boolean
  fetchData: (() => void) | null | undefined
}

const ProjectHeaderPlaceholder = ({ hasError, fetchData }: Props): JSX.Element => {
  const isIdfProjectHeader = useFeatureFlag('idf_project_header')

  React.useEffect(() => {
    if (!isIdfProjectHeader) {
      return
    }

    const placeholder = document.querySelector('.projectHeaderIdfPlaceholder')
    if (!placeholder) {
      return
    }

    const container = placeholder.closest('.container')
    if (!container || container.classList.contains('container-fluid')) {
      return
    }

    container.classList.add('container-fluid')
    container.classList.remove('container')

    return () => {
      container.classList.remove('container-fluid')
      container.classList.add('container')
    }
  }, [isIdfProjectHeader])

  if (isIdfProjectHeader) {
    return null
  }

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
      <Box width="100%" paddingX={[4, 0]}>
        <Skeleton.Text width="100%" height="56px" />
      </Box>
    </ProjectHeader>
  )
}

export default ProjectHeaderPlaceholder
