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
    const statusClasses = {};
    if (status) {
      statusClasses[`status--${status.color}`] = true;
    }

    return <CardStatus className={classNames(statusClasses)}>{status && status.name}</CardStatus>;
  }
};

export default createFragmentContainer(
  ProposalStatus,
  {
    proposal: graphql`
      fragment ProposalStatus_proposal on Proposal
      @argumentDefinitions(stepId: { type: "ID" })
      {
        id
        status(step: $stepId) {
          name
          color
        }
      }
    `,
  }
);
