/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Collapse, ListGroupItem } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';

type Props = {
  proposal: Object,
  isAuthenticated: boolean,
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

  onUnfollowCurrentProposal(proposalId: string, Auth: boolean) {
    this.setState({ open: !this.state.open }, () => {
      UnfollowProposalMutation.commit({
        input: {
          proposalId,
        },
        isAuthenticated: Auth,
      }).then(() => {
        return true;
      });
    });
  }

  render() {
    const { proposal, isAuthenticated } = this.props;
    return (
      <Collapse in={this.state.open} id={`collapse-proposal-${proposal.id}`}>
        <div>
          <ListGroupItem id={`item-proposal-${proposal.id}`}>
            <div className="ml-25">
              <h4>
                <a
                  href={proposal.show_url}
                  title={proposal.title}
                  id={`item-proposal-link-${proposal.id}`}
                  className="profile__proposal__open__link">
                  {proposal.title}
                </a>
                <Button
                  style={{ float: 'right' }}
                  className="profile__proposal__unfollow__button"
                  id={`profile-proposal-unfollow-button-${proposal.id}`}
                  onClick={() => {
                    this.onUnfollowCurrentProposal(proposal.id, isAuthenticated);
                  }}>
                  <FormattedMessage id="unfollow" />
                </Button>
              </h4>
            </div>
          </ListGroupItem>
        </div>
      </Collapse>
    );
  }
}
export default ProposalRow;
