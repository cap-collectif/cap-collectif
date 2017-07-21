import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedMessage } from 'react-intl';
import ProposalCreate from '../Proposal/Create/ProposalCreate';

const CollectStepPageHeader = React.createClass({
  propTypes: {
    total: PropTypes.number.isRequired,
    queryCount: PropTypes.number,
    countFusions: PropTypes.number,
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      categories,
      queryCount,
      total,
      countFusions,
      form,
    } = this.props;
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
        { ' ' }
        <span style={{ color: '#999', fontWeight: 300 }}>
          <FormattedMessage
            message={this.getIntlMessage('proposal.count_fusions')}
            num={countFusions}
          />
        </span>
        <span className="pull-right">
          <ProposalCreate
            form={form}
            categories={categories}
          />
        </span>
      </h3>
    );
  },

});

export default connect(state => ({ queryCount: state.proposal.queryCount }))(CollectStepPageHeader);
