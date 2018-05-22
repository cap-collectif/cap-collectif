// @flow
import * as React from 'react';
import { FormattedNumber } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProposalDetailEstimation_proposal } from './__generated__/ProposalDetailEstimation_proposal.graphql';

type Props = {
  proposal: ProposalDetailEstimation_proposal,
  showNullEstimation: boolean,
};

export class ProposalDetailEstimation extends React.Component<Props> {
  render() {
    const { proposal, showNullEstimation } = this.props;
    const estimation = !proposal.estimation && showNullEstimation ? 0 : proposal.estimation;

    return estimation !== null && typeof estimation !== 'undefined' ? (
      <div className="tags-list__tag ellipsis">
        <i className="cap cap-coins-2-1 icon--blue" />
        <FormattedNumber
          minimumFractionDigits={0}
          value={estimation}
          style="currency"
          currency="EUR"
        />
      </div>
    ) : null;
  }
}

export default createFragmentContainer(ProposalDetailEstimation, {
  proposal: graphql`
    fragment ProposalDetailEstimation_proposal on Proposal {
      estimation
    }
  `,
});
