import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import ProposalCreate from '../Proposal/Create/ProposalCreate';

const CollectStepPageHeader = React.createClass({
  propTypes: {
    count: PropTypes.number,
    countFusions: PropTypes.number,
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      count: 0,
    };
  },

  render() {
    const {
      categories,
      count,
      countFusions,
      form,
    } = this.props;
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        <FormattedMessage
          message={this.getIntlMessage('proposal.count')}
          num={count}
        />
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

export default CollectStepPageHeader;
