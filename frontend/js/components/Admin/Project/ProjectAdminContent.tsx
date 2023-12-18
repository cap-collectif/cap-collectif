import React, { useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { loadQuery, RelayEnvironmentProvider } from 'relay-hooks'
import { formValueSelector } from 'redux-form'
import { BrowserRouter as Router, Link, Route, Switch, useLocation } from 'react-router-dom'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import type { ProjectAdminContent_project } from '~relay/ProjectAdminContent_project.graphql'
import '~relay/ProjectAdminContent_project.graphql'
import type { ProjectAdminContent_query } from '~relay/ProjectAdminContent_query.graphql'
import '~relay/ProjectAdminContent_query.graphql'
import environment from '~/createRelayEnvironment'
import type { GlobalState } from '~/types'
import ProjectAdminForm from './Form/ProjectAdminForm'
import { Content, Count, Header, NavContainer, NavItem } from './ProjectAdminContent.style'
import {
  initialVariables as queryVariableProposal,
  renameInitialVariable,
} from '~/components/Admin/Project/ProjectAdminProposalsPage'
import ProjectAdminAnalysisTab, {
  initialVariables as queryVariableAnalysis,
  queryAnalysis,
} from '~/components/Admin/Project/ProjectAdminAnalysisTab'
import ProjectAdminParticipantTab, {
  initialVariables as queryVariableParticipant,
  queryParticipant,
} from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipantTab'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import { BoxDeprecated, BoxContainer } from './Form/ProjectAdminForm.style'
import { ProjectAdminProposalsProvider } from '~/components/Admin/Project/ProjectAdminPage.context'
import { ProjectAdminParticipantsProvider } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant.context'
import ProjectAdminContributionsPage, {
  queryContributions,
} from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminContributionsPage'
import { getContributionsPath } from '~/components/Admin/Project/ProjectAdminContributions/IndexContributions/IndexContributions'
import { ARGUMENT_PAGINATION } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ArgumentTab/ArgumentTab'
import { VOTE_PAGINATION } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/VoteTab/VoteTab'
import { getProjectAdminPath, getProjectAdminBaseUrl } from './ProjectAdminPage.utils'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import htmlDecode from '~/components/Utils/htmlDecode'
type Props = {
  readonly viewerIsAdmin: boolean
  readonly project: ProjectAdminContent_project
  readonly query: ProjectAdminContent_query
  readonly firstCollectStepId: string | null | undefined
  readonly hasIdentificationCodeLists: boolean
}
type Links = Array<{
  title: string
  count?: number
  url: string
  to: string
  component: any
}>

const getRouteContributionPath = (
  project: ProjectAdminContent_project,
  baseUrlContributions: string,
  firstCollectStepId: string | null | undefined,
): string => {
  const collectSteps = project.steps.filter(step => step.__typename === 'CollectStep')
  const debateSteps = project.steps.filter(step => step.__typename === 'DebateStep')
  const questionnaireSteps = project.steps.filter(step => step.__typename === 'QuestionnaireStep')
  const hasCollectStep = collectSteps.length > 0
  const hasDebateStep = debateSteps.length > 0
  const hasquestionnaireSteps = questionnaireSteps.length > 0
  const onlyDebateStep =
    !hasCollectStep && !hasquestionnaireSteps && debateSteps.length === 1 && !!project.firstDebateStep
  const onlyCollectStep = !hasDebateStep && !hasquestionnaireSteps && collectSteps.length === 1 && firstCollectStepId
  const onlyQuestionnaireStep =
    !hasCollectStep && !hasDebateStep && questionnaireSteps.length === 1 && !!project.firstQuestionnaireStep

  if (onlyCollectStep && firstCollectStepId) {
    return getContributionsPath(baseUrlContributions, 'CollectStep', firstCollectStepId)
  }

  if (onlyDebateStep && project.firstDebateStep) {
    return getContributionsPath(
      baseUrlContributions,
      'DebateStep',
      project.firstDebateStep.id,
      project.firstDebateStep.slug,
    )
  }

  if (onlyQuestionnaireStep && project.firstQuestionnaireStep) {
    return getContributionsPath(
      baseUrlContributions,
      'QuestionnaireStep',
      project.firstQuestionnaireStep.id,
      project.firstQuestionnaireStep.slug,
    )
  }

  return baseUrlContributions
}

const formatNavbarLinks = (
  project: ProjectAdminContent_project,
  query: ProjectAdminContent_query,
  path: string,
  setTitle: (arg0: string) => void,
  firstCollectStepId: string | null | undefined,
  dataPrefetchPage,
  location: string,
  viewerIsAdmin: boolean,
  hasIdentificationCodeLists: boolean,
  newCreateProjectFlag: boolean,
) => {
  const links = []
  const baseUrlContributions = getProjectAdminPath(project._id, 'CONTRIBUTIONS', newCreateProjectFlag)
  const isCollectStepPage = location === getContributionsPath(baseUrlContributions, 'CollectStep')
  links.push({
    title: 'global.contribution',
    count: isCollectStepPage ? project.proposals.totalCount : undefined,
    url: baseUrlContributions,
    to: getRouteContributionPath(project, baseUrlContributions, firstCollectStepId),
    component: () => (
      <ProjectAdminContributionsPage dataPrefetch={dataPrefetchPage.contributions} projectId={project.id} />
    ),
  })
  links.push({
    title: 'capco.section.metrics.participants',
    count: project.contributors.totalCount,
    url: getProjectAdminPath(project._id, 'PARTICIPANTS', newCreateProjectFlag),
    to: getProjectAdminPath(project._id, 'PARTICIPANTS', newCreateProjectFlag),
    component: () => (
      <ProjectAdminParticipantsProvider>
        <ProjectAdminParticipantTab projectId={project.id} dataPrefetch={dataPrefetchPage.participant} />
      </ProjectAdminParticipantsProvider>
    ),
  })

  if (project.hasAnalysis) {
    links.push({
      title: 'proposal.tabs.evaluation',
      url: getProjectAdminPath(project._id, 'ANALYSIS', newCreateProjectFlag),
      to: getProjectAdminPath(project._id, 'ANALYSIS', newCreateProjectFlag),
      count: project.firstAnalysisStep ? project.firstAnalysisStep.proposals.totalCount : undefined,
      component: () => (
        <ProjectAdminProposalsProvider firstCollectStepId={firstCollectStepId}>
          <ProjectAdminAnalysisTab projectId={project.id} dataPrefetch={dataPrefetchPage.analysis} />
        </ProjectAdminProposalsProvider>
      ),
    })
  }

  links.push({
    title: 'global.mediator',
    url: getProjectAdminPath(project.id, 'MEDIATOR', true),
    to: getProjectAdminPath(project.id, 'MEDIATOR', true),
    component: () => <></>,
  })

  links.push({
    title: 'global.configuration',
    url: getProjectAdminPath(newCreateProjectFlag ? project.id : project._id, 'CONFIGURATION', newCreateProjectFlag),
    to: getProjectAdminPath(newCreateProjectFlag ? project.id : project._id, 'CONFIGURATION', newCreateProjectFlag),
    component: () =>
      newCreateProjectFlag ? (
        <></>
      ) : (
        <ProjectAdminForm
          project={project}
          onTitleChange={setTitle}
          viewerIsAdmin={viewerIsAdmin}
          query={query}
          hasIdentificationCodeLists={hasIdentificationCodeLists}
        />
      ),
  })
  return links
}

export const ProjectAdminContent = ({
  project,
  firstCollectStepId,
  hasIdentificationCodeLists,
  viewerIsAdmin,
  query,
}: Props) => {
  const location = useLocation()
  const [title, setTitle] = useState<string>(project.title)
  const path = getProjectAdminBaseUrl(project._id)
  const hasProjectRevisionEnabled = useFeatureFlag('proposal_revisions')
  const newCreateProjectFlag = useFeatureFlag('unstable__new_create_project')

  const dataAnalysisPrefetch = loadQuery()
  dataAnalysisPrefetch.next(
    environment,
    queryAnalysis,
    {
      projectId: project.id,
      ...queryVariableAnalysis,
      proposalRevisionsEnabled: hasProjectRevisionEnabled ?? false,
    },
    {
      fetchPolicy: 'store-or-network',
    },
  )
  const dataContributionsPrefetch = loadQuery()
  dataContributionsPrefetch.next(
    environment,
    queryContributions,
    {
      // CollectStep
      // @ts-ignore
      ...renameInitialVariable(queryVariableProposal(viewerIsAdmin)),
      projectId: project.id,
      proposalStep: firstCollectStepId,
      proposalRevisionsEnabled: hasProjectRevisionEnabled ?? false,
      proposalOrderBy: [
        {
          field: 'PUBLISHED_AT',
          direction: 'DESC',
        },
      ],
      // DebateStep (argument)
      countArgumentPagination: ARGUMENT_PAGINATION,
      cursorArgumentPagination: null,
      argumentValue: null,
      isPublishedArgument: true,
      isTrashedArgument: false,
      // DebateStep (vote)
      isPublishedVote: null,
      countVotePagination: VOTE_PAGINATION,
      cursorVotePagination: null,
      // QuestionnaireStep
      countRepliesPagination: 20,
      cursorRepliesPagination: null,
      repliesTerm: null,
      repliesOrderBy: {
        field: 'CREATED_AT',
        direction: 'DESC',
      },
      repliesFilterStatus: ['PUBLISHED', 'DRAFT', 'NOT_PUBLISHED', 'PENDING'],
    },
    {
      fetchPolicy: 'store-or-network',
    },
  )
  const dataParticipantPrefetch = loadQuery()
  dataParticipantPrefetch.next(
    environment,
    queryParticipant,
    {
      projectId: project.id,
      ...queryVariableParticipant(project.id, viewerIsAdmin),
    },
    {
      fetchPolicy: 'store-or-network',
    },
  )
  // TODO @Vince
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dataPrefetchPage = {
    analysis: dataAnalysisPrefetch,
    contributions: dataContributionsPrefetch,
    participant: dataParticipantPrefetch,
  }
  const links: Links = useMemo(
    () =>
      formatNavbarLinks(
        project,
        query,
        path,
        setTitle,
        firstCollectStepId,
        dataPrefetchPage,
        location.pathname,
        viewerIsAdmin,
        hasIdentificationCodeLists,
        newCreateProjectFlag,
      ),
    [
      project,
      query,
      path,
      setTitle,
      firstCollectStepId,
      dataPrefetchPage,
      location.pathname,
      viewerIsAdmin,
      hasIdentificationCodeLists,
      newCreateProjectFlag,
    ],
  )
  return (
    <div className="d-flex">
      <Header>
        <div>
          <h1>{htmlDecode(title)}</h1>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <Icon name={ICON_NAME.externalLink} size="14px" />
            <FormattedMessage id="global.preview" />
          </a>
        </div>

        <NavContainer>
          {links.map((link, idx) => (
            <NavItem key={idx} active={location.pathname.includes(link.url)}>
              {(link.title === 'global.configuration' && newCreateProjectFlag) || link.title === 'global.mediator' ? (
                <a href={link.to} id={link.title}>
                  <FormattedMessage id={link.title} />
                </a>
              ) : (
                <Link to={link.to}>
                  <FormattedMessage id={link.title} />
                </Link>
              )}

              {link.count !== undefined && <Count active={location.pathname.includes(link.url)}>{link.count}</Count>}
            </NavItem>
          ))}
        </NavContainer>
      </Header>

      <Content>
        {viewerIsAdmin && (
          <BoxContainer className="box container-fluid" color="#ffc206">
            <BoxDeprecated>
              <FormattedMessage id="message.page.previous.version" />
              <a href={project.adminUrl}>
                <FormattedMessage id="global.consult" /> <i className="cap cap-arrow-66" />
              </a>
            </BoxDeprecated>
          </BoxContainer>
        )}
        <Switch>
          {links.map(link => (
            <Route key={link.url} path={link.url}>
              {link.component()}
            </Route>
          ))}
        </Switch>
      </Content>
    </div>
  )
}

const ProjectAdminRouterWrapper = ({
  project,
  query,
  firstCollectStepId,
  hasIdentificationCodeLists,
  viewerIsAdmin,
}: Props & {
  readonly firstCollectStepId?: string | null | undefined
}) => (
  <RelayEnvironmentProvider environment={environment}>
    <Router>
      <ProjectAdminContent
        viewerIsAdmin={viewerIsAdmin}
        project={project}
        query={query}
        firstCollectStepId={firstCollectStepId}
        hasIdentificationCodeLists={hasIdentificationCodeLists}
      />
    </Router>
  </RelayEnvironmentProvider>
)

const mapStateToProps = (state: GlobalState) => ({
  viewerIsAdmin: state.user.user ? state.user.user.isAdmin : false,
  title: formValueSelector('projectAdminForm')(state, 'title'),
})

export default createFragmentContainer(connect<any, any>(mapStateToProps)(ProjectAdminRouterWrapper), {
  project: graphql`
    fragment ProjectAdminContent_project on Project {
      _id
      id
      title
      url
      hasAnalysis
      adminUrl
      proposals {
        totalCount
      }
      steps {
        id
        __typename
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
      ...ProjectAdminForm_project
    }
  `,
  query: graphql`
    fragment ProjectAdminContent_query on Query {
      ...ProjectAdminForm_query
    }
  `,
})
