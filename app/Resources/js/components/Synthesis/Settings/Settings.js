import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

const Settings = React.createClass({
  propTypes: {
    synthesis: PropTypes.object,
    params: PropTypes.object,
    children: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      params: { type: 'display' },
    };
  },

  render() {
    return (
      <div className="synthesis__settings">
        {this.props.children}
      </div>
    );
  },

});

export default Settings;
