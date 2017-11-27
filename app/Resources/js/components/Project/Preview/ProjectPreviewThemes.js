// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const ProjectPreviewThemes = React.createClass({
  propTypes: {
    project: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
  },

  render() {
    const { project, features } = this.props;
    if (features.themes && project.themes.length > 0) {
      return (
        <div className="excerpt project__preview__themes small ellipsis">
          {project.themes.map((theme, index) => {
            return (
              <span key={index}>
                <a className="excerpt" href={theme._links.show}>
                  {theme.title}
                </a>
                {index < project.themes.length - 1 && <span>, </span>}
              </span>
            );
          })}
        </div>
      );
    }
    return <div className="excerpt project__preview__themes small" />;
  },
});

const mapStateToProps = state => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(ProjectPreviewThemes);
