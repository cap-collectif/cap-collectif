// @flow
import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { BrowserRouter as Router, Link, Route, Switch, useLocation } from 'react-router-dom';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { type ProjectAdminContent_project } from '~relay/ProjectAdminContent_project.graphql';
import type { FeatureToggles, GlobalState } from '~/types';
import ProjectAdminForm from './Form/ProjectAdminForm';
import { Content, Count, Header, NavContainer, NavItem } from './ProjectAdminContent.style';
import ProjectAdminProposals from '~/components/Admin/Project/ProjectAdminProposals';

type Props = {|
  features: FeatureToggles,
  project: ProjectAdminContent_project,
|};

type Links = Array<{|
  title: string,
  count?: number,
  url: string,
  component: any,
|}>;

// TODO replace the WIP placeholder when components are ready
const formatNavbarLinks = (project, features, path, setTitle) => {
  const links = [];
  const hasCollectStep = project.steps.some(step => step.type === 'CollectStep');
  if (hasCollectStep)
    links.push({
      title: 'global.contribution',
      count: project.proposals.totalCount,
      url: `${path}/proposals`,
      component: () => <ProjectAdminProposals project={project} />,
    });
  links.push({
    title: 'capco.section.metrics.participants',
    count: project.contributors.totalCount,
    url: `${path}/contributors`,
    component: () => <p style={{ marginLeft: '45%' }}>WIP</p>,
  });

  if (features.unstable__analysis && project.hasAnalysis)
    links.push({
      title: 'proposal.tabs.evaluation',
      url: `${path}/analysis`,
      component: () => <p style={{ marginLeft: '45%' }}>WIP</p>,
    });
  links.push({
    title: 'global.configuration',
    url: `${path}/edit`,
    component: () => <ProjectAdminForm project={project} onTitleChange={setTitle} />,
  });
  return links;
};

// TODO: change when the page is complete
const basePath = '/admin/alpha/project/';

export const ProjectAdminContent = ({ project, features }: Props) => {
  const location = useLocation();
  const [title, setTitle] = useState(project.title);
  const path = `${basePath}${project._id}`;
  const links: Links = useMemo(() => formatNavbarLinks(project, features, path, setTitle), [
    project,
    features,
    path,
    setTitle,
  ]);
  return (
    <div className="d-flex">
      <Header>
        <div>
          <h1>{title}</h1>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <i className="cap cap-external-link ml-5" />
            <FormattedMessage id="action_show" />
          </a>
        </div>
        <NavContainer>
          {links.map((link, idx) => (
            <NavItem key={idx} active={location.pathname === link.url}>
              <Link to={link.url}>
                <FormattedMessage id={link.title} />
              </Link>
              {link.count !== undefined && (
                <Count active={location.pathname === link.url}>{link.count}</Count>
              )}
            </NavItem>
          ))}
        </NavContainer>
      </Header>
      <Content>
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

const ProjectAdminRouterWrapper = ({ project, features }: Props) => (
  <Router>
    <ProjectAdminContent project={project} features={features} />
  </Router>
);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
  title: formValueSelector('projectAdminForm')(state, 'title'),
});

export default createFragmentContainer(connect(mapStateToProps)(ProjectAdminRouterWrapper), {
  project: graphql`
    fragment ProjectAdminContent_project on Project
      @argumentDefinitions(
        projectId: { type: "ID!" }
        count: { type: "Int!" }
        cursor: { type: "String" }
      ) {
      _id
      title
      url
      hasAnalysis
      proposals(first: $count, after: $cursor) {
        totalCount
      }
      contributors {
        totalCount
      }
      steps {
        type: __typename
      }
      ...ProjectAdminProposals_project
        @arguments(projectId: $projectId, count: $count, cursor: $cursor)
      ...ProjectAdminForm_project
    }
  `,
});
