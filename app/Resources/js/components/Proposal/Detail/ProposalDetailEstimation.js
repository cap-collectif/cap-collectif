import React, { PropTypes } from 'react';
import { FormattedNumber } from 'react-intl';

const ProposalDetailEstimation = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    showNullEstimation: PropTypes.bool.isRequired,
  },

  render() {
    const { showNullEstimation, proposal } = this.props;
    const estimation = !proposal.estimation && showNullEstimation ? 0 : proposal.estimation;

    return estimation !== null && typeof estimation !== 'undefined' ? (
      <div className="proposal__info">
        <i className="cap cap-coins-2-1 icon--blue" />
        <FormattedNumber
          minimumFractionDigits={0}
          value={estimation}
          style="currency"
          currency="EUR"
        />
      </div>
    ) : null;
  },
});

export default ProposalDetailEstimation;
