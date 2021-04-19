// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~ui/FeedbacksIndicators/Loader';
import CustomProjectListView from './CustomProjectListView';
import ProjectsListPlaceholder from '~/components/Project/List/ProjectsListPlaceholder';
import type { FeatureToggles, GlobalState } from '~/types';

type Props = {|
  +projectsCount: number,
  +features: FeatureToggles,
|};

const query = graphql`
  query CustomProjectListQuery($count: Int, $cursor: String) {
    homePageProjectsSectionAdmin {
      projects {
        edges {
          node {
            ...ProjectPreview_project
          }
        }
      }
    }
  }
`;

const CustomProjectList = ({ projectsCount, features }: Props) => {
  return (
    <QueryRenderer
      environment={environment}
      query={query}
      variables={{
        author: null,
        count: projectsCount,
        cursor: null,
      }}
      render={({ error, props }) => {
        if (error) {
          return graphqlError;
        }
        if (props?.homePageProjectsSectionAdmin) {
          return (
            <CustomProjectListView
              homePageProjectsSectionAdmin={props.homePageProjectsSectionAdmin}
              features={features}
            />
          );
        }
        return features.unstable__new_project_card ? (
          <ProjectsListPlaceholder count={projectsCount} />
        ) : (
          <Loader />
        );
      }}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(CustomProjectList);
