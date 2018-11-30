// @flow
import * as React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import Card from '../../Ui/Card/Card';
import type { ProposalStatus_proposal } from './__generated__/ProposalStatus_proposal.graphql';

type Props = {
  proposal: ProposalStatus_proposal,
};

export class ProposalStatus extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    let { status } = proposal;
    if (proposal.trashed) {
      status = {
        color: 'default',
        name: (
          <FormattedMessage
            id={
              proposal.trashedStatus === 'VISIBLE'
                ? 'proposal.show.trashed.reason.moderated'
                : 'proposal.show.trashed.reason.deleted'
            }
          />
        ),
      };
    }
    if (!status) {
      return null;
    }
    // const statusClasses = {};
    // statusClasses[`status--${status.color}`] = true;

    return <Card.Status bgColor={status.color}>{status && status.name}</Card.Status>;
  }
}

export default createFragmentContainer(ProposalStatus, {
  proposal: graphql`
    fragment ProposalStatus_proposal on Proposal
      @argumentDefinitions(
        stepId: { type: "ID", nonNull: true }
        isProfileView: { type: "Boolean", defaultValue: false }
      ) {
      trashed
      trashedStatus
      status(step: $stepId) @skip(if: $isProfileView) {
        name
        color
      }
    }
  `,
});
