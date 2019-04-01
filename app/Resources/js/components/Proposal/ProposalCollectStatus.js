// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import classNames from 'classnames';
import type { ProposalCollectStatus_proposal } from '~relay/ProposalCollectStatus_proposal.graphql';

type Props = {
  proposal: ProposalCollectStatus_proposal,
};

export class ProposalCollectStatus extends React.Component<Props> {
  render() {
    const { status } = this.props.proposal;
    const statusClasses = {
      proposal__status: true,
    };
    if (status) {
      statusClasses[`status--${status.color}`] = true;
    }

    return <div className={classNames(statusClasses)}>{status && status.name}</div>;
  }
}

export default createFragmentContainer(
  ProposalCollectStatus,
  graphql`
    fragment ProposalCollectStatus_proposal on Proposal {
      status {
        color
        name
      }
    }
  `,
);
