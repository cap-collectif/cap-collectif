/**
 * @flow
 */
import React, {Component} from 'react';
import { FormattedMessage} from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';

type Props = {
  proposal: Object
};

export class ProposalRow extends Component<Props> {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: true
    };
  }

  onUnfollowCurrentProposal(proposalId: string){
    this.setState({open: !this.state.open}, () => {
        UnfollowProposalMutation.commit(
          {input: {
              proposalId
            }
          }).then(
          () => {
            return true;
          }
        )
      }
    );
  }

  render() {
    const {proposal} = this.props;
    return (
      <Collapse in={this.state.open}>
        <div>
          <h3><a href={proposal.show_url}>{proposal.title}</a></h3>
          <Button
            onClick={this.onUnfollowCurrentProposal.bind(this, proposal.id)}>
            <FormattedMessage id="unfollow"/>
          </Button>
        </div>
      </Collapse>
    );
  }
}
export default ProposalRow;
