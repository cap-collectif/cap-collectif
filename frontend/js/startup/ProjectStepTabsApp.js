// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../createRelayEnvironment';
import IntlProvider from './IntlProvider';
import ProjectStepTabs, { type Props } from '../components/Project/ProjectStepTabs';
import { type ProjectStepTabsAppQueryResponse } from '~relay/ProjectStepTabsAppQuery.graphql';

const ProjectStepTabsAppRender = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?ProjectStepTabsAppQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    return <ProjectStepTabs {...props} />;
  }
  return null;
};

export default (props: Props) => {
  const { projectId } = props;
  return (
    <Provider store={ReactOnRails.getStore('appStore')}>
      <IntlProvider>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProjectStepTabsAppQuery($projectId: ID!) {
              project: node(id: $projectId) {
                ... on Project {
                  ...ProjectStepTabs_project
                }
              }
            }
          `}
          variables={{ projectId }}
          render={ProjectStepTabsAppRender}
        />
      </IntlProvider>
    </Provider>
  );
};
