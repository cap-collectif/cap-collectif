/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, ListGroupItem } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';

type Props = {
  proposal: Object,
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
    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({
        input: {
          proposalId,
        },
      }).then(() => {
        return true;
      });
    });
  }

  render() {
    const { proposal } = this.props;
    return (
      <Collapse in={this.state.open} id={`collapse-proposal-${proposal.id}`}>
        <ListGroupItem id={`item-proposal-${proposal.id}`}>
          <h4>
            <a
              href={proposal.show_url}
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
export default ProposalRow;
