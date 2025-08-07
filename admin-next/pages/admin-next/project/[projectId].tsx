import * as React from 'react'
import { NextPage } from 'next'
import { CapUIIconSize, Flex, Spinner, TabBar } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { PageProps } from 'types'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { ProjectIdQuery } from '@relay/ProjectIdQuery.graphql'
import ProjectConfigForm from '@components/BackOffice/Projects/ProjectConfig/ProjectConfigForm'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { getProjectAdminPath, getRouteContributionPath } from '@components/BackOffice/Projects/ProjectTabs.utils'
import { pxToRem } from '@shared/utils/pxToRem'

export interface ProjectConfigPageProps {
  projectId: string
}

export const QUERY = graphql`
  query ProjectIdQuery($id: ID!) {
    node(id: $id) {
      id
      ... on Project {
        canEdit
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
          ... on ConsultationStep {
            id
            contributions {
              totalCount
            }
          }
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
      ...ProjectConfigForm_project
    }
  }
`

const ProjectConfigPage: React.FC<ProjectConfigPageProps> = ({ projectId }) => {
  const intl = useIntl()

  const response = useLazyLoadQuery<ProjectIdQuery>(QUERY, { id: projectId })
  const project = response.node

  const isMediatorEnabled = useFeatureFlag('mediator')
  const isNewBackOfficeEnabled = useFeatureFlag('unstable__new_create_project')

  if (!project || !project?.canEdit || !isNewBackOfficeEnabled) {
    window.location.href = '/admin-next/projects'
    return null
  }

  const steps = project.steps
  const hasSelectionStep = steps.some(step => step.__typename === 'SelectionStep')

  const consultationStep = project.steps.find(step => step.__typename === 'ConsultationStep')
  const consultationContribCount = consultationStep?.contributions?.totalCount ?? 0

  const baseUrlContributions = getProjectAdminPath(project.id, 'CONTRIBUTIONS')

  return (
    <TabBar
      defaultTab={'global.configuration'}
      position={'absolute'}
      top={0}
      left={0}
      width={'100%'}
      height={pxToRem(48)}
    >
      <TabBar.Pane
        title={intl.formatMessage({ id: 'global.contribution' })}
        id="global.contribution"
        href={getRouteContributionPath(
          project,
          baseUrlContributions,
          !!project.firstCollectStep ? project.firstCollectStep.id : null,
        )}
        count={project.proposals.totalCount + consultationContribCount}
      />

      <TabBar.Pane
        title={intl.formatMessage({ id: 'capco.section.metrics.participants' })}
        id="capco.section.metrics.participants"
        href={getProjectAdminPath(project.id, 'PARTICIPANTS')}
        count={project.contributors.totalCount}
      />

      {project.hasAnalysis && (
        <TabBar.Pane
          title={intl.formatMessage({ id: 'proposal.tabs.evaluation' })}
          id="proposal.tabs.evaluation"
          href={getProjectAdminPath(project.id, 'ANALYSIS')}
          count={project.firstAnalysisStep ? project.firstAnalysisStep.proposals.totalCount : undefined}
        />
      )}

      {isMediatorEnabled && hasSelectionStep && (
        <TabBar.Pane
          title={intl.formatMessage({ id: 'global.mediators' })}
          id="global.mediators"
          href={getProjectAdminPath(project.id, 'MEDIATOR')}
        />
      )}

      <TabBar.Pane
        title={intl.formatMessage({ id: 'global.configuration' })}
        id="global.configuration"
        href={!isNewBackOfficeEnabled ? getProjectAdminPath(project.id, 'CONFIGURATION', isNewBackOfficeEnabled) : null}
      >
        {isNewBackOfficeEnabled && <ProjectConfigForm project={project} />}
      </TabBar.Pane>
    </TabBar>
  )
}

const ProjectConfig: NextPage<PageProps> = ({}) => {
  const intl = useIntl()
  const router = useRouter()
  const { projectId } = router.query
  if (projectId) {
    return (
      <Layout navTitle={intl.formatMessage({ id: 'global.all.projects' })}>
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <ProjectConfigPage projectId={String(projectId)} />
        </React.Suspense>
      </Layout>
    )
  }
  return null
}

export const getServerSideProps = withPageAuthRequired

export default ProjectConfig
