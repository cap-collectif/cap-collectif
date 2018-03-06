import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

const SelectionStepPageHeader = React.createClass({
  propTypes: {
    queryCount: PropTypes.number,
    total: PropTypes.number.isRequired
  },

  render() {
    const { queryCount, total } = this.props;
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        {typeof queryCount !== 'undefined' && total !== queryCount ? (
          <FormattedMessage
            id="proposal.count_with_total"
            values={{
              num: queryCount,
              total
            }}
          />
        ) : (
          <FormattedMessage
            id="proposal.count"
            values={{
              num: total
            }}
          />
        )}
      </h3>
    );
  }
});

export default connect(state => ({ queryCount: state.proposal.queryCount }))(
  SelectionStepPageHeader
);
