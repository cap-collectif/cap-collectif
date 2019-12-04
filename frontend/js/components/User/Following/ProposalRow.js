/**
 * @flow
 */
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, ListGroupItem } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import { type ProposalRow_proposal } from '~relay/ProposalRow_proposal.graphql';

type Props = {
  proposal: ProposalRow_proposal,
};

type State = {
  open: boolean,
};
export class ProposalRow extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      open: true,
    };
  }

  onUnfollowCurrentProposal(proposalId: string) {
    const { open } = this.state;
    this.setState({ open: !open }, () => {
      UnfollowProposalMutation.commit({
        input: {
          proposalId,
        },
      }).then(() => true);
    });
  }

  render() {
    const { proposal } = this.props;
    const { open } = this.state;
    return (
      <Collapse in={open} id={`collapse-proposal-${proposal.id}`}>
        <ListGroupItem id={`item-proposal-${proposal.id}`}>
          <h4>
            <a
              href={proposal.url}
              title={proposal.title}
              id={`item-proposal-link-${proposal.id}`}
              className="profile__proposal__open__link">
              {proposal.title}
            </a>
          </h4>
          <Button
            id={`profile-proposal-unfollow-button-${proposal.id}`}
            onClick={() => {
              this.onUnfollowCurrentProposal(proposal.id);
            }}>
            <FormattedMessage id="unfollow" />
          </Button>
        </ListGroupItem>
      </Collapse>
    );
  }
}
export default createFragmentContainer(ProposalRow, {
  proposal: graphql`
    fragment ProposalRow_proposal on Proposal {
      id
      title
      url
    }
  `,
});
