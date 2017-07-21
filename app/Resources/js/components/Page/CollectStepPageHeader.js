import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ProposalCreate from '../Proposal/Create/ProposalCreate';

const CollectStepPageHeader = React.createClass({
  propTypes: {
    total: PropTypes.number.isRequired,
    queryCount: PropTypes.number,
    countFusions: PropTypes.number,
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
  },

  render() {
    const { categories, queryCount, total, countFusions, form } = this.props;
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        {typeof queryCount !== 'undefined' && total !== queryCount
          ? <FormattedMessage
              id="proposal.count_with_total"
              values={{
                num: queryCount,
                total,
              }}
            />
          : <FormattedMessage
              id="proposal.count"
              values={{
                num: total,
              }}
            />}{' '}
        {countFusions > 0 &&
          <span style={{ color: '#999', fontWeight: 300 }}>
            <FormattedMessage
              id="proposal.count_fusions"
              values={{
                num: countFusions,
              }}
            />
          </span>}
        <span className="pull-right">
          <ProposalCreate form={form} categories={categories} />
        </span>
      </h3>
    );
  },
});

export default connect(state => ({ queryCount: state.proposal.queryCount }))(
  CollectStepPageHeader,
);
