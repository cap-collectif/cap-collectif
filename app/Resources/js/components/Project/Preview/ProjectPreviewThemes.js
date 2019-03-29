// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import type { State } from '../../../types';
import InlineList from '../../Ui/List/InlineList';
import type { ProjectPreviewThemes_project } from '~relay/ProjectPreviewThemes_project.graphql';

type Props = {
  project: ProjectPreviewThemes_project,
  features: Object,
};

class ProjectPreviewThemes extends React.Component<Props> {
  render() {
    const { project, features } = this.props;
    if (features.themes && project.themes && project.themes.length > 0) {
      return (
        <InlineList className="small excerpt">
          {project.themes.map((theme, index) => (
            <li key={index}>
              <a href={theme.url}>{theme.title}</a>
            </li>
          ))}
        </InlineList>
      );
    }
    return null;
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(ProjectPreviewThemes), {
  project: graphql`
    fragment ProjectPreviewThemes_project on Project {
      themes {
        title
        url
      }
    }
  `,
});
