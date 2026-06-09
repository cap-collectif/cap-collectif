import * as React from 'react'
import { Box, Flex, Skeleton } from '@cap-collectif/ui'
import ProjectHeader from '~ui/Project/ProjectHeader'
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { useSelector } from 'react-redux'
import { GlobalState } from '~/types'

type Props = {
  hasError: boolean
  fetchData: (() => void) | null | undefined
}

const ProjectHeaderPlaceholder = ({ hasError, fetchData }: Props): JSX.Element => {
  const isIdfProjectHeader = useFeatureFlag('idf_project_header')
  const mainColor = useSelector((state: GlobalState) => state.default.parameters['color.btn.primary.bg'])

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
    return (
      <Box
        className="projectHeaderIdfPlaceholder"
        bg={mainColor || 'neutral-gray.900'}
        width="100%"
        paddingY={[3, 4]}
        paddingX={[4, 8]}
      >
        {hasError && <ErrorQuery retry={fetchData} />}
        <Flex direction={['column', 'row']} alignItems={['flex-start', 'center']} justifyContent="space-between">
          <Flex direction={['column', 'row']} alignItems={['flex-start', 'center']} spacing={[2, 8]} flexWrap="wrap">
            <Skeleton.Text size="sm" width={['75%', '260px']} />
            <Flex direction="row" alignItems="center" spacing={[4, 8]} flexWrap="wrap">
              <Skeleton.Text width="70px" />
              <Skeleton.Text width="70px" />
              <Skeleton.Text width="70px" />
            </Flex>
          </Flex>
          <Flex direction="row" alignItems="center" spacing={[4, 6]} marginTop={[2, 0]}>
            <Skeleton.Text width="70px" />
            <Skeleton.Text width="110px" />
          </Flex>
        </Flex>
      </Box>
    )
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
