// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

const ProjectPreviewCounter = React.createClass({
  propTypes: {
    value: React.PropTypes.number.isRequired,
    label: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
    showZero: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      style: {},
      showZero: false,
    };
  },

  render() {
    const { value, label, style, showZero } = this.props;
    if (value > 0 || showZero) {
      return (
        <div className="thumbnail__number-block" style={style}>
          <div className="thumbnail__number">
            {value}
          </div>
          <div className="thumbnail__number__label excerpt small">
            <FormattedMessage id={label} values={{ num: value }} />
          </div>
        </div>
      );
    }
    return null;
  },
});

export default ProjectPreviewCounter;
