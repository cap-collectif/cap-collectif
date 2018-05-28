// @flow
import * as React from 'react';
import classNames from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import CardStatus from '../../Ui/Card/CardStatus';
import type { ProposalStatus_proposal } from './__generated__/ProposalStatus_proposal.graphql';

type Props = {
  proposal: ProposalStatus_proposal,
};

export class ProposalStatus extends React.Component<Props> {
  render() {
    const status = this.props.proposal.status;
    if (!status) {
      return null;
    }
    const statusClasses = {};
    statusClasses[`status--${status.color}`] = true;

    return <CardStatus className={classNames(statusClasses)}>{status && status.name}</CardStatus>;
  }
}

export default createFragmentContainer(ProposalStatus, {
  proposal: graphql`
    fragment ProposalStatus_proposal on Proposal
      @argumentDefinitions(
        stepId: { type: "ID", nonNull: true }
        isProfileView: { type: "Boolean", defaultValue: false }
      ) {
      id
      status(step: $stepId) @skip(if: $isProfileView) {
        name
        color
      }
    }
  `,
});
