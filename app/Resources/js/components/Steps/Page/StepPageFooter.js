import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';

const StepPageFooter = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    const footer = step.footer;
    if (!footer) {
      return null;
    }
    return (
      <div>
        <div
          className="block block--bordered"
          style={{ marginTop: 30 }}
        >
          <div style={{ padding: 10 }}>
            <FormattedHTMLMessage message={footer} />
          </div>
        </div>
      </div>
    );
  },

});

export default StepPageFooter;
