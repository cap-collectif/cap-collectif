import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';

const ProjectPreviewThemes = React.createClass({
  propTypes: {
    project: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project, features } = this.props;
    if (features.themes && project.themes.length > 0) {
      return (
        <span className="excerpt">
          {
            project.themes.map((theme, index) => {
              if (theme.enabled) {
                return (
                  <span key={index}>
                    <a
                      className="excerpt"
                      href={theme._links.show}
                    >
                      {theme.title}
                    </a>
                    {
                      index < project.themes.length - 1
                      ? <span>, </span>
                      : null
                    }
                  </span>
                );
              }
            })
          }
        </span>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return { features: state.features };
};

export default connect(mapStateToProps)(ProjectPreviewThemes);
