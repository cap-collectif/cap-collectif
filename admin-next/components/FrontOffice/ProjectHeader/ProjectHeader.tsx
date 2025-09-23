'use client'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Box, BoxProps, CapUIFontSize, Flex, Heading } from '@cap-collectif/ui'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, Suspense } from 'react'
import ProjectHeaderAuthors from './ProjectHeaderAuthors'
import ProjectHeaderStats from './ProjectHeaderStats'
import ProjectHeaderThemesAndDistricts from './ProjectHeaderThemesAndDistricts'
import ProjectHeaderStatsPlaceholder from './ProjectHeaderStatsSkeleton'
import ProjectHeaderCover from './ProjectHeaderCover'
import { useLazyLoadQuery, graphql } from 'react-relay'
import ProjectStepTabs from '@shared/projectFrise/ProjectStepTabs'
import { ProjectHeaderStepTabsQuery } from '@relay/ProjectHeaderStepTabsQuery.graphql'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { usePathname } from 'next/navigation'
import { removeAccents } from '@shared/utils/removeAccents'

type ProjectHeaderProps = {
  project: layoutProjectQuery$data['project']
  defaultAvatarImage?: string
  projectSlug: string
}

export const QUERY = graphql`
  query ProjectHeaderStepTabsQuery($projectSlug: String!, $stepSlug: String!) {
    project: nodeSlug(entity: PROJECT, slug: $projectSlug) {
      ... on Project {
        ...ProjectStepTabs_project
      }
    }
    step: nodeSlug(entity: STEP, slug: $stepSlug, projectSlug: $projectSlug) {
      ... on Step {
        id
      }
    }
  }
`

const ProjectStepTabsQuery: FC<{ projectSlug: string }> = ({ projectSlug }) => {
  const pathname = usePathname()

  const stepSlug = removeAccents(decodeURI(pathname.substring(pathname.lastIndexOf('/') + 1)))

  const { project, step } = useLazyLoadQuery<ProjectHeaderStepTabsQuery>(QUERY, { projectSlug, stepSlug })
  const { siteColors } = useAppContext()

  return (
    <ProjectStepTabs
      currentStepId={step?.id}
      project={project}
      mainColor={siteColors.primaryColor}
      // Those styles are temporary - because this component is shared with our legacy frontend
      // TODO - rewrite ProjectStepTabs once all of the /project/ block is on the next app
      mb={pxToRem(-32)}
      mt={pxToRem(-24)}
    />
  )
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
    <Box backgroundColor="white" as="header" role="banner">
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
      <Box maxWidth={pxToRem(1280)} margin="auto">
        <Suspense fallback="TODO with the first step - not used right now">
          <ProjectStepTabsQuery projectSlug={projectSlug} />
        </Suspense>
      </Box>
    </Box>
  )
}

export default ProjectHeader
