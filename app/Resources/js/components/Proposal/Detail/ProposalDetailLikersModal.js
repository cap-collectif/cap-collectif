// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { ListGroupItem, Modal } from 'react-bootstrap';
import { closeDetailLikersModal } from '../../../redux/modules/proposal';
import type { ProposalDetailLikersModal_proposal } from './__generated__/ProposalDetailLikersModal_proposal.graphql';
import UserAvatar from '../../User/UserAvatar';
import ListGroupFlush from '../../Ui/List/ListGroupFlush';
import type { Dispatch } from '../../../types';

type Props = { proposal: ProposalDetailLikersModal_proposal, show: boolean, dispatch: Dispatch };

export class ProposalDetailLikersModal extends React.Component<Props> {
  handleClose = (e: Event) => {
    const { dispatch } = this.props;
    e.preventDefault();
    dispatch(closeDetailLikersModal());
  };

  render() {
    const { proposal, show } = this.props;

    if (proposal.likers && proposal.likers.length > 0) {
      return (
        <Modal show={show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FormattedMessage
                id="proposal.likers.count"
                values={{
                  num: proposal.likers.length,
                }}
              />
            </Modal.Title>
          </Modal.Header>
          <ListGroupFlush>
            {proposal.likers.map((liker, key) => (
              <ListGroupItem key={key} className="d-flex text-left">
                <UserAvatar
                  user={{
                    username: liker.username,
                    media: liker.media,
                    _links: { profile: liker.url },
                  }}
                />
                <div className="d-flex flex-column justify-content-around">
                  <a href={liker.url}>{liker.displayName}</a>
                  {liker.biography && <p className="excerpt">{liker.biography}</p>}
                </div>
              </ListGroupItem>
            ))}
          </ListGroupFlush>
        </Modal>
      );
    }
    return null;
  }
}

const container = connect()(ProposalDetailLikersModal);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDetailLikersModal_proposal on Proposal {
      id
      likers {
        id
        displayName
        biography
        url
        username
        vip
        media {
          url
        }
      }
    }
  `,
});
