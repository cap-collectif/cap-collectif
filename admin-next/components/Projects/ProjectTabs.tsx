import * as React from 'react'
import { Box, CapUIFontWeight, CapUIShadow, Flex, FlexProps } from '@cap-collectif/ui'
import { useRouter } from 'next/router'
import { graphql, useFragment } from 'react-relay'
import { ProjectTabs_project$key } from '@relay/ProjectTabs_project.graphql'
import {
  getProjectAdminPath,
  getRouteContributionPath,
} from '@components/Projects/ProjectTabs.utils'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import useFeatureFlag from "../../hooks/useFeatureFlag";

export interface ProjectTabsProps extends FlexProps {
  project: ProjectTabs_project$key
}

const FRAGMENT = graphql`
  fragment ProjectTabs_project on Project {
    _id
    id
    title
    url
    hasAnalysis
    adminUrl
    proposals {
      totalCount
    }
    steps(excludePresentationStep: true) {
      id
      label
      __typename
      slug
    }
    firstCollectStep {
      id
      slug
    }
    firstDebateStep {
      id
      slug
    }
    firstQuestionnaireStep {
      id
      slug
    }
    firstAnalysisStep {
      proposals {
        totalCount
      }
    }
    contributors {
      totalCount
    }
  }
`

const ProjectTabs: React.FC<ProjectTabsProps> = ({ project: projectRef }) => {
  const project = useFragment<ProjectTabs_project$key>(FRAGMENT, projectRef)
  const router = useRouter()
  const intl = useIntl()
  const isMediatorEnabled = useFeatureFlag('mediator');

  const steps = project.steps;
  const hasSelectionStep = steps.some(step => step.__typename === 'SelectionStep');

  const getLinks = project => {
    const links = []
    const baseUrlContributions = getProjectAdminPath(project.id, 'CONTRIBUTIONS')

    links.push({
      title: 'global.contribution',
      count: project.proposals.totalCount,
      url: baseUrlContributions,
      to: getRouteContributionPath(
        project,
        baseUrlContributions,
        !!project.firstCollectStep ? project.firstCollectStep.id : null,
      ),
    })
    links.push({
      title: 'capco.section.metrics.participants',
      count: project.contributors.totalCount,
      url: getProjectAdminPath(project.id, 'PARTICIPANTS'),
      to: getProjectAdminPath(project.id, 'PARTICIPANTS'),
    })
    if (project.hasAnalysis) {
      links.push({
        title: 'proposal.tabs.evaluation',
        url: getProjectAdminPath(project.id, 'ANALYSIS'),
        to: getProjectAdminPath(project.id, 'ANALYSIS'),
        count: project.firstAnalysisStep ? project.firstAnalysisStep.proposals.totalCount : undefined,
      })
    }
    if (isMediatorEnabled && hasSelectionStep) {
      links.push({
        title: 'global.mediator',
        url: getProjectAdminPath(project.id, 'MEDIATOR'),
        to: getProjectAdminPath(project.id, 'MEDIATOR'),
      })
    }
    links.push({
      title: 'global.configuration',
      url: getProjectAdminPath(project.id, 'CONFIGURATION'),
      to: getProjectAdminPath(project.id, 'CONFIGURATION'),
    })
    return links
  }
  const links = useMemo(() => getLinks(project), [project, router.asPath])
  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      backgroundColor="#FFF"
      display="inline-flex"
      justifyContent="flex-start"
      align="center"
      height="48px"
      minHeight="48px"
      width="100%"
      boxShadow={CapUIShadow.Small}
      gap={6}
      paddingX={6}
    >
      {links.map(link => {
        const isMediatorTab = router.asPath.includes('/mediators')
        const active = isMediatorTab ? link.url.includes('/mediators') : router.asPath.includes(link.url)
        return (
          <Box
            as="a"
            href={link.to}
            key={link.to}
            fontSize={1}
            fontWeight={CapUIFontWeight.Bold}
            color={active ? 'blue.500' : 'gray.700'}
            borderBottomColor={active ? 'blue.500' : 'transparent'}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            sx={{
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxSizing: 'border-box',
              borderBottom: '2px solid transparent',
              '&:hover': {
                color: 'blue.500',
                borderBottomColor: 'blue.500',
              },
            }}
          >
            {intl.formatMessage({ id: link.title })}
            {link.count !== undefined && (
              <Box
                as="span"
                bg={active ? 'rgba(3, 136, 204, 0.2)' : 'neutral-gray.150'}
                color={active ? 'blue.500' : 'neutral-gray.500'}
                sx={{
                  fontWeight: 600,
                  height: '16px',
                  padding: '0 4px',
                  borderRadius: '8px',
                  marginLeft: '5px',
                  fontSize: '12px',
                }}
              >
                {link.count}
              </Box>
            )}
          </Box>
        )
      })}
    </Flex>
  )
}

export default ProjectTabs
