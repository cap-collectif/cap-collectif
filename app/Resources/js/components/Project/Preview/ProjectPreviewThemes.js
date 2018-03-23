// @flow
import React, { PropTypes } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from '../../../types';
import InlineList from '../../Ui/List/InlineList';

const ProjectPreviewThemes = React.createClass({
  propTypes: {
    project: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
  },

  render() {
    const { project, features } = this.props;
    if (features.themes && project.themes.length > 0) {
      return (
        <InlineList className="small excerpt">
          {project.themes.map((theme, index) => {
            return (
              <li key={index}>
                <a href={theme._links.show}>{theme.title}</a>
              </li>
            );
          })}
        </InlineList>
      );
    }
    return null;
  },
});

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(ProjectPreviewThemes);
