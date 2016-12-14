import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const SelectionStepPageHeader = React.createClass({
  propTypes: {
    count: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { count } = this.props;
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        <FormattedMessage
          message={this.getIntlMessage('proposal.count')}
          num={count}
        />
      </h3>
    );
  },

});

export default SelectionStepPageHeader;
