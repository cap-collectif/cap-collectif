// @flow
import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { loadQuery, RelayEnvironmentProvider } from 'relay-hooks';
import { formValueSelector } from 'redux-form';
import { BrowserRouter as Router, Link, Route, Switch, useLocation } from 'react-router-dom';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { type ProjectAdminContent_project } from '~relay/ProjectAdminContent_project.graphql';
import environment from '~/createRelayEnvironment';
import type { FeatureToggles, GlobalState } from '~/types';
import ProjectAdminForm from './Form/ProjectAdminForm';
import { Content, Count, Header, NavContainer, NavItem } from './ProjectAdminContent.style';
import {
  initialVariables as queryVariableProposal,
  renameInitialVariable,
} from '~/components/Admin/Project/ProjectAdminProposalsPage';
import ProjectAdminAnalysisTab, {
  initialVariables as queryVariableAnalysis,
  queryAnalysis,
} from '~/components/Admin/Project/ProjectAdminAnalysisTab';
import ProjectAdminParticipantTab, {
  initialVariables as queryVariableParticipant,
  queryParticipant,
} from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipantTab';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { BoxDeprecated, BoxContainer } from './Form/ProjectAdminForm.style';
import { ProjectAdminProposalsProvider } from '~/components/Admin/Project/ProjectAdminPage.context';
import { ProjectAdminParticipantsProvider } from '~/components/Admin/Project/ProjectAdminParticipantTab/ProjectAdminParticipant.context';
import ProjectAdminContributionsPage, {
  queryContributions,
} from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminContributionsPage';
import { getContributionsPath } from '~/components/Admin/Project/ProjectAdminContributions/IndexContributions/IndexContributions';
import { ARGUMENT_PAGINATION } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ArgumentTab/ArgumentTab';
import { VOTE_PAGINATION } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/VoteTab/VoteTab';
import { getProjectAdminPath, getProjectAdminBaseUrl } from './ProjectAdminPage.utils';

type Props = {|
  +features: FeatureToggles,
  +project: ProjectAdminContent_project,
  +firstCollectStepId: ?string,
|};

type Links = Array<{|
  title: string,
  count?: number,
  url: string,
  to: string,
  component: any,
|}>;

const getRouteContributionPath = (
  project: ProjectAdminContent_project,
  baseUrlContributions: string,
  firstCollectStepId: ?string,
): string => {
  const collectSteps = project.steps.filter(step => step.__typename === 'CollectStep');
  const debateSteps = project.steps.filter(step => step.__typename === 'DebateStep');

  const hasCollectStep = collectSteps.length > 0;
  const hasDebateStep = debateSteps.length > 0;

  const onlyDebateStep = !hasCollectStep && debateSteps.length === 1 && !!project.firstDebateStep;
  const onlyCollectStep = !hasDebateStep && collectSteps.length === 1 && firstCollectStepId;

  if (onlyCollectStep && firstCollectStepId) {
    return getContributionsPath(baseUrlContributions, 'CollectStep', firstCollectStepId);
  }

  if (onlyDebateStep && project.firstDebateStep) {
    return getContributionsPath(
      baseUrlContributions,
      'DebateStep',
      project.firstDebateStep.id,
      project.firstDebateStep.slug,
    );
  }

  return baseUrlContributions;
};

const formatNavbarLinks = (
  project: ProjectAdminContent_project,
  features: FeatureToggles,
  path: string,
  setTitle: string => void,
  firstCollectStepId: ?string,
  dataPrefetchPage,
  location: string,
) => {
  const links = [];
  const baseUrlContributions = getProjectAdminPath(project._id, 'CONTRIBUTIONS');
  const isCollectStepPage = location === getContributionsPath(baseUrlContributions, 'CollectStep');

  links.push({
    title: 'global.contribution',
    count: isCollectStepPage ? project.proposals.totalCount : undefined,
    url: baseUrlContributions,
    to: getRouteContributionPath(project, baseUrlContributions, firstCollectStepId),
    component: () => (
      <ProjectAdminContributionsPage
        dataPrefetch={dataPrefetchPage.contributions}
        projectId={project.id}
      />
    ),
  });

  links.push({
    title: 'capco.section.metrics.participants',
    count: project.contributors.totalCount,
    url: getProjectAdminPath(project._id, 'PARTICIPANTS'),
    to: getProjectAdminPath(project._id, 'PARTICIPANTS'),
    component: () => (
      <ProjectAdminParticipantsProvider>
        <ProjectAdminParticipantTab
          projectId={project.id}
          dataPrefetch={dataPrefetchPage.participant}
        />
      </ProjectAdminParticipantsProvider>
    ),
  });

  if (features.unstable__analysis && project.hasAnalysis) {
    links.push({
      title: 'proposal.tabs.evaluation',
      url: getProjectAdminPath(project._id, 'ANALYSIS'),
      to: getProjectAdminPath(project._id, 'ANALYSIS'),
      count: project.firstAnalysisStep ? project.firstAnalysisStep.proposals.totalCount : undefined,
      component: () => (
        <ProjectAdminProposalsProvider firstCollectStepId={firstCollectStepId}>
          <ProjectAdminAnalysisTab
            projectId={project.id}
            dataPrefetch={dataPrefetchPage.analysis}
          />
        </ProjectAdminProposalsProvider>
      ),
    });
  }

  links.push({
    title: 'global.configuration',
    url: getProjectAdminPath(project._id, 'CONFIGURATION'),
    to: getProjectAdminPath(project._id, 'CONFIGURATION'),
    component: () => <ProjectAdminForm project={project} onTitleChange={setTitle} />,
  });

  return links;
};

export const ProjectAdminContent = ({ project, firstCollectStepId, features }: Props) => {
  const location = useLocation();
  const [title, setTitle] = useState<string>(project.title);
  const path = getProjectAdminBaseUrl(project._id);

  const dataAnalysisPrefetch = loadQuery();
  dataAnalysisPrefetch.next(
    environment,
    queryAnalysis,
    {
      projectId: project.id,
      ...queryVariableAnalysis,
      proposalRevisionsEnabled: features.proposal_revisions ?? false,
    },
    { fetchPolicy: 'store-or-network' },
  );

  const dataContributionsPrefetch = loadQuery();
  dataContributionsPrefetch.next(
    environment,
    queryContributions,
    {
      // CollectStep
      ...renameInitialVariable(queryVariableProposal),
      projectId: project.id,
      proposalStep: firstCollectStepId,
      proposalRevisionsEnabled: features.proposal_revisions ?? false,
      // DebateStep (argument)
      countArgumentPagination: ARGUMENT_PAGINATION,
      cursorArgumentPagination: null,
      argumentValue: null,
      isPublishedArgument: true,
      isTrashedArgument: false,
      // DebateStep (vote)
      countVotePagination: VOTE_PAGINATION,
      cursorVotePagination: null,
    },
    { fetchPolicy: 'store-or-network' },
  );

  const dataParticipantPrefetch = loadQuery();
  dataParticipantPrefetch.next(
    environment,
    queryParticipant,
    { projectId: project.id, ...queryVariableParticipant(project.id) },
    { fetchPolicy: 'store-or-network' },
  );

  const dataPrefetchPage = {
    analysis: dataAnalysisPrefetch,
    contributions: dataContributionsPrefetch,
    participant: dataParticipantPrefetch,
  };

  const links: Links = useMemo(
    () =>
      formatNavbarLinks(
        project,
        features,
        path,
        setTitle,
        firstCollectStepId,
        dataPrefetchPage,
        location.pathname,
      ),
    [project, features, path, setTitle, firstCollectStepId, dataPrefetchPage, location.pathname],
  );

  return (
    <div className="d-flex">
      <Header>
        <div>
          <h1>{title}</h1>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <Icon name={ICON_NAME.externalLink} size="14px" />
            <FormattedMessage id="global.preview" />
          </a>
        </div>

        <NavContainer>
          {links.map((link, idx) => (
            <NavItem key={idx} active={location.pathname.includes(link.url)}>
              <Link to={link.to}>
                <FormattedMessage id={link.title} />
              </Link>

              {link.count !== undefined && (
                <Count active={location.pathname.includes(link.url)}>{link.count}</Count>
              )}
            </NavItem>
          ))}
        </NavContainer>
      </Header>

      <Content>
        <BoxContainer className="box container-fluid" color="#ffc206">
          <BoxDeprecated>
            <FormattedMessage id="message.page.previous.version" />
            <a href={project.adminUrl}>
              <FormattedMessage id="global.consult" /> <i className="cap cap-arrow-66" />
            </a>
          </BoxDeprecated>
        </BoxContainer>

        <Switch>
          {links.map(link => (
            <Route key={link.url} path={link.url}>
              {link.component()}
            </Route>
          ))}
        </Switch>
      </Content>
    </div>
  );
};

const ProjectAdminRouterWrapper = ({
  project,
  features,
  firstCollectStepId,
}: {
  ...Props,
  +firstCollectStepId?: ?string,
}) => (
  <RelayEnvironmentProvider environment={environment}>
    <Router>
      <ProjectAdminContent
        project={project}
        features={features}
        firstCollectStepId={firstCollectStepId}
      />
    </Router>
  </RelayEnvironmentProvider>
);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  title: formValueSelector('projectAdminForm')(state, 'title'),
});

export default createFragmentContainer(connect(mapStateToProps)(ProjectAdminRouterWrapper), {
  project: graphql`
    fragment ProjectAdminContent_project on Project
      @argumentDefinitions(projectId: { type: "ID!" }) {
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
});
