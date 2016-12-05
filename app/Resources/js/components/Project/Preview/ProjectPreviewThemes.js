import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';

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
        <div className="excerpt project__preview__themes small">
          <Truncate lines={1}>
            {
              project.themes.map((theme, index) => {
                return (
                  <span key={index}>
                  <a
                    className="excerpt"
                    href={theme._links.show}
                  >
                    {theme.title}
                  </a>
                    {
                      index < project.themes.length - 1 &&
                      <span>, </span>
                    }
                </span>
                );
              })
            }
          </Truncate>
        </div>
      );
    }
    return (
      <div className="excerpt project__preview__themes small"></div>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(ProjectPreviewThemes);
