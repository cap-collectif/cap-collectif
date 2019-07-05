// @flow
import * as React from 'react';
import { FormattedNumber } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProposalDetailEstimation_proposal } from '~relay/ProposalDetailEstimation_proposal.graphql';
import Tag from '../../Ui/Labels/Tag';

type Props = {
  proposal: ProposalDetailEstimation_proposal,
  showNullEstimation: boolean,
  className?: string,
  size?: string,
};

export class ProposalDetailEstimation extends React.Component<Props> {
  render() {
    const { size, className, proposal, showNullEstimation } = this.props;
    const estimation = !proposal.estimation && showNullEstimation ? 0 : proposal.estimation;

    return estimation !== null && typeof estimation !== 'undefined' ? (
      <Tag size={size} className={className} icon="cap cap-coins-2-1 icon--blue">
        <FormattedNumber
          minimumFractionDigits={0}
          value={estimation}
          style="currency"
          currency="EUR"
        />
      </Tag>
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
