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
        <div>
          <ListGroupItem id={`item-proposal-${proposal.id}`}>
            <div className="ml-25">
              <h4>
                <a
                  href={proposal.show_url}
                  title={proposal.title}
                  className="profile__proposal__open__link">
                  {proposal.title}
                </a>
                <Button
                  style={{ float: 'right' }}
                  className="profile__proposal__unfollow__button"
                  onClick={this.onUnfollowCurrentProposal.bind(this, proposal.id)}>
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
