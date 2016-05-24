import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

const DisplaySettings = React.createClass({
  propTypes: {
    synthesis: PropTypes.object,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <div className="display-settings">
        coucou
      </div>
    );
  },

});

export default DisplaySettings;
