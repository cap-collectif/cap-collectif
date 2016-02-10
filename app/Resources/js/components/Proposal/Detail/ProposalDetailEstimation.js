import React from 'react';
import { IntlMixin, FormattedNumber } from 'react-intl';

const ProposalDetailEstimation = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    showNullEstimation: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const estimation = !proposal.estimation && this.props.showNullEstimation ? 0 : proposal.estimation;

    return estimation !== null && typeof estimation !== 'undefined'
      ? <span className="proposal__info">
          <i className="cap cap-coins-2-1 icon--yellow"></i>
          <FormattedNumber value={estimation} style="currency" currency="EUR" />
        </span>
      : null
    ;
  },
});

export default ProposalDetailEstimation;
