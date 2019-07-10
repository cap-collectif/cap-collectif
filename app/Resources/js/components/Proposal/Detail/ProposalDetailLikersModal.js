// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroupItem, Modal } from 'react-bootstrap';
import { closeDetailLikersModal } from '../../../redux/modules/proposal';
import type { ProposalDetailLikersModal_proposal } from '~relay/ProposalDetailLikersModal_proposal.graphql';
import UserAvatarDeprecated from '../../User/UserAvatarDeprecated';
import ListGroupFlush from '../../Ui/List/ListGroupFlush';
import type { Dispatch } from '../../../types';

type Props = {
  proposal: ProposalDetailLikersModal_proposal,
  show: boolean,
  dispatch: Dispatch,
  intl: IntlShape,
};

export class ProposalDetailLikersModal extends React.Component<Props> {
  handleHide = (e: SyntheticEvent<HTMLButtonElement>) => {
    const { dispatch } = this.props;
    e.preventDefault();
    dispatch(closeDetailLikersModal());
  };

  render() {
    const { proposal, show, intl } = this.props;

    if (proposal.likers.length === 0) {
      return null;
    }

    return (
      <Modal show={show} onHide={this.handleHide}>
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
            <ListGroupItem key={key} className={`${liker.vip ? 'bg-vip' : ''} d-flex text-left`}>
              {/* $FlowFixMe Will be a fragment soon */}
              <UserAvatarDeprecated
                user={{
                  username: liker.username,
                  media: liker.media,
                  _links: { profile: liker.url },
                }}
              />
              <div className="d-flex flex-column justify-content-around">
                <a
                  href={liker.url}
                  title={intl.formatMessage(
                    { id: 'usernames-profile' },
                    { userName: liker.displayName },
                  )}>
                  {liker.displayName}
                </a>
                {liker.userType && liker.userType.name && (
                  <p className="excerpt">{liker.userType.name}</p>
                )}
              </div>
            </ListGroupItem>
          ))}
        </ListGroupFlush>
      </Modal>
    );
  }
}

const container = connect()(injectIntl(ProposalDetailLikersModal));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDetailLikersModal_proposal on Proposal {
      id
      likers {
        id
        displayName
        userType {
          name
        }
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
