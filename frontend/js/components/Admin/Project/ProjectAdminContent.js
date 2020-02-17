// @flow
import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from 'react-router-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { type ProjectAdminContent_project } from '~relay/ProjectAdminContent_project.graphql';
import type { FeatureToggles, GlobalState } from '~/types';
import ProjectAdminForm from './Form/ProjectAdminForm';
import { NavContainer, NavItem, Count, Header, Content } from './ProjectAdminContent.style';

type Props = {|
  features: FeatureToggles,
  project: ProjectAdminContent_project,
|};

// TODO replace the WIP placeholder when components are ready
const formatNavbarLinks = (project, features, path) => {
  const links = [];
  const hasCollectStep = project.steps.some(step => step.type === 'collect');
  if (hasCollectStep)
    links.push({
      title: 'global.contribution',
      count: project.proposals.totalCount,
      url: `${path}/proposals`,
      component: () => <p style={{ marginLeft: '45%' }}>WIP</p>,
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
  links.push({ title: 'global.configuration', url: `${path}/edit`, component: ProjectAdminForm });
  return links;
};

// TODO: change when the page is complete
const basePath = '/admin/alpha/project/';

export const ProjectAdminContent = ({ project, features }: Props) => {
  const location = useLocation();
  const path = `${basePath}${project._id}`;
  const links = formatNavbarLinks(project, features, path);
  return (
    <div className="d-flex">
      <Header>
        <div>
          <h1>{project.title}</h1>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <i className="cap cap-external-link ml-5" />
            <FormattedMessage id="preview" />
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
          {links.map(link => {
            const Component = link.component;
            return (
              <Route key={link.url} path={link.url}>
                <Component project={project} />
              </Route>
            );
          })}
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
});

export default createFragmentContainer(connect(mapStateToProps)(ProjectAdminRouterWrapper), {
  project: graphql`
    fragment ProjectAdminContent_project on Project {
      _id
      title
      url
      hasAnalysis
      proposals {
        totalCount
      }
      contributors {
        totalCount
      }
      steps {
        type
      }
      ...ProjectAdminForm_project
    }
  `,
});
