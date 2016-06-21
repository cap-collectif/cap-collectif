import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import ProposalCreate from '../Proposal/Create/ProposalCreate';

const CollectStepPageHeader = React.createClass({
  propTypes: {
    count: PropTypes.number,
    form: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      count: 0,
    };
  },

  render() {
    return (
      <h3 className="h3" style={{ marginBottom: '15px' }}>
        <FormattedMessage
          message={this.getIntlMessage('proposal.count')}
          num={this.props.count}
        />
        <span className="pull-right">
          <ProposalCreate
            form={this.props.form}
            themes={this.props.themes}
            districts={this.props.districts}
            categories={this.props.categories}
          />
        </span>
      </h3>
    );
  },

});

export default CollectStepPageHeader;
