import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage } from 'react-intl';

const SelectionStepPageHeader = React.createClass({
  propTypes: {
    queryCount: PropTypes.number,
    total: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { queryCount, total } = this.props;
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        {
          typeof queryCount !== 'undefined' && total !== queryCount
            ? <FormattedMessage
              message={this.getIntlMessage('proposal.count_with_total')}
              num={queryCount}
              total={total}
              />
          : <FormattedMessage
            message={this.getIntlMessage('proposal.count')}
            num={total}
            />
        }
      </h3>
    );
  },

});

export default connect(state => ({ queryCount: state.proposal.queryCount }))(SelectionStepPageHeader);
