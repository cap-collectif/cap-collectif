import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage } from 'react-intl';

const SelectionStepPageHeader = React.createClass({
  propTypes: {
    count: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { count, total } = this.props;
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        {
          total === count
            ? <FormattedMessage
              message={this.getIntlMessage('proposal.count')}
              num={count}
              />
          : <FormattedMessage
            message={this.getIntlMessage('proposal.count_with_total')}
            num={count}
            total={total}
            />
        }
      </h3>
    );
  },

});

export default connect((state, props) => ({ count: state.proposal.queryCount || props.total }))(SelectionStepPageHeader);
