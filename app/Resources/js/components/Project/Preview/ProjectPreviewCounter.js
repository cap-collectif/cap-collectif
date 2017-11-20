// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const ProjectPreviewCounter = React.createClass({
  propTypes: {
    value: React.PropTypes.number.isRequired,
    label: React.PropTypes.string.isRequired,
    showZero: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      showZero: false,
    };
  },

  render() {
    const { value, label, showZero } = this.props;
    if (value > 0 || showZero) {
      return (
        <div className="excerpt">
          <span className="counter__value">{value} </span>
          <span>
            <FormattedMessage id={label} values={{ num: value }} />
          </span>
        </div>
      );
    }
    return null;
  },
});

export default ProjectPreviewCounter;
