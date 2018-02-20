// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Dropdown,DropdownButton, DropdownToggle, DropdownMenu, DropdownItem,MenuItem,Item , Panel, ListGroup, ListGroupItem, FormGroup, Radio} from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import FollowProposalMutation from '../../../mutations/FollowProposalMutation';
import type { ProposalFollowButton_proposal } from './__generated__/ProposalFollowButton_proposal.graphql';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import LoginOverlay from '../../Utils/LoginOverlay';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

type Props = {
  proposal: ProposalFollowButton_proposal,
};
type State = {
  isHovering: boolean,
};

export class ProposalFollowButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isHovering: false,
    };
  }

  render() {
    const { proposal } = this.props;
    const { isHovering } = this.state;
    const buttonFollowId = proposal.viewerIsFollowing
      ? 'proposal-unfollow-btn'
      : 'proposal-follow-btn';
    let style = '';
    let bsStyle = '';
    let buttonText = '';
    if (!proposal.viewerIsFollowing) {
      buttonText = 'follow';
      bsStyle = 'default';
    }
    if (proposal.viewerIsFollowing && isHovering) {
      buttonText = 'unfollow';
      bsStyle = 'danger';
    }
    if (proposal.viewerIsFollowing && !isHovering) {
      buttonText = 'following';
      style = 'btn-default_focus';
      bsStyle = 'default';
    }

    return (
      <LoginOverlay>
        <span className="mb-0 proposal-follow-dropdown">
        <DropdownButton
          className="mb-0"
          id={buttonFollowId}
          title={
            <FormattedMessage id={buttonText} />
          }>
          <Panel header={<FormattedMessage id="to-be-notified-of-new-of" />} className="mb-0 bn">
            <FormGroup className="bn mb-0">
              <ListGroup className="mb-0">
                <ListGroupItem className="">
                <Radio  name="radioGroup" inline>
                  Label 1
                </Radio>
                </ListGroupItem>
                <ListGroupItem className="">
                <Radio  name="radioGroup" inline>
                  Label 2
                </Radio>
                </ListGroupItem>
                <ListGroupItem className="">
                <Radio  name="radioGroup" inline>
                  Label 3
                </Radio>
                </ListGroupItem>
              </ListGroup>
            </FormGroup>
          </Panel>
          <MenuItem eventKey="1" className="mt--1" ><FormattedMessage id="unfollow"/></MenuItem>
        </DropdownButton>
        </span>
      </LoginOverlay>
    );
  }
}

export default createFragmentContainer(
  ProposalFollowButton,
  graphql`
    fragment ProposalFollowButton_proposal on Proposal {
      id
      viewerIsFollowing
    }
  `,
);
