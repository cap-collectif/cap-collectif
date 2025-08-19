'use client'

import { Box, BoxProps, CapUIFontSize, Flex, Heading } from '@cap-collectif/ui'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, Suspense } from 'react'
import ProjectHeaderAuthors from './ProjectHeaderAuthors'
import ProjectHeaderStats from './ProjectHeaderStats'
import ProjectHeaderThemesAndDistricts from './ProjectHeaderThemesAndDistricts'
import ProjectHeaderStatsPlaceholder from './ProjectHeaderStatsSkeleton'
import ProjectHeaderCover from './ProjectHeaderCover'

type ProjectHeaderProps = {
  project: layoutProjectQuery$data['project']
  defaultAvatarImage?: string
  projectSlug: string
}

export const ProjectHeader: FC<BoxProps & ProjectHeaderProps> = ({
  projectSlug,
  project,
  defaultAvatarImage,
  ...rest
}) => {
  const { authors, title } = project
  const hasMultipleAuthors = authors.length > 1

  return (
    <Box backgroundColor="white" as="header">
      <Flex
        maxWidth={pxToRem(1280)}
        width="100%"
        margin="auto"
        py={8}
        pt={[0, 8]}
        px={[0, 4, 6]}
        direction={['column-reverse', 'row']}
        alignItems={['flex-start', 'center']}
        justify="space-between"
        {...rest}
      >
        <Flex direction="column" gap={[0, 'md']} px={['md', 0]} mt={[pxToRem(hasMultipleAuthors ? -10 : -20), 0]}>
          <ProjectHeaderAuthors authors={authors} defaultAvatarImage={defaultAvatarImage} />
          <Heading as="h1" fontWeight={600} fontSize={[CapUIFontSize.DisplaySmall, CapUIFontSize.DisplayMedium]}>
            {title}
          </Heading>
          <Suspense fallback={<ProjectHeaderStatsPlaceholder />}>
            <ProjectHeaderStats projectSlug={projectSlug} />
          </Suspense>
          <ProjectHeaderThemesAndDistricts project={project} />
        </Flex>
        <ProjectHeaderCover project={project} />
      </Flex>
    </Box>
  )
}

export default ProjectHeader
