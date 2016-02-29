import React from 'react';
import { IntlMixin } from 'react-intl';
import FeatureStore from '../../../stores/FeatureStore';

const ProjectPreviewThemes = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;
    if (FeatureStore.isActive('themes') && project.themes.length > 0) {
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

export default ProjectPreviewThemes;
