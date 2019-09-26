// @flow
import React from 'react';
import { Modal, ListGroupItem, Button } from 'react-bootstrap';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { UserInGroupModal_group } from '~relay/UserInGroupModal_group.graphql';
import { UserAvatarDeprecated } from '../../User/UserAvatarDeprecated';
import CloseButton from '../../Form/CloseButton';
import ListGroupFlush from '../../Ui/List/ListGroupFlush';

type RelayProps = {|
  group: UserInGroupModal_group,
|};

type Props = {|
  ...RelayProps,
  show: boolean,
  handleClose: () => void,
  relay: RelayPaginationProp,
  intl: IntlShape,
|};
type State = {
  loading: boolean,
};

export class UserInGroupModal extends React.Component<Props, State> {
  state = {
    loading: false,
  };

  closeModal = () => {
    this.props.handleClose();
  };

  loadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(10, () => {
      this.setState({ loading: false });
    });
  };

  render() {
    const { show, group, relay, intl } = this.props;
    return (
      <div>
        <Modal
          id={`${group.id}-modal`}
          animation={false}
          show={show}
          onHide={this.closeModal}
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <b>{group.title}</b>
            </Modal.Title>
          </Modal.Header>
          {group.users !== null && group.users.edges && group.users.edges.length > 0 && (
            <ListGroupFlush>
              {group.users.edges
                .filter(Boolean)
                .map(edge => edge && edge.node)
                .filter(Boolean)
                .map(user => (
                  <ListGroupItem className="d-flex text-left" key={user.id} id={user.id}>
                    {/* $FlowFixMe will be a fragment soon */}
                    <UserAvatarDeprecated
                      user={{
                        username: user.username,
                        media: user.media,
                        _links: { profile: user.url },
                      }}
                      defaultAvatar={null}
                    />
                    <a
                      href={user.url}
                      className="align-self-center"
                      title={intl.formatMessage(
                        { id: 'usernames-profile' },
                        { userName: user.username },
                      )}>
                      {user.username}
                    </a>
                  </ListGroupItem>
                ))}
              {relay.hasMore() && (
                <div className="text-center mt-15 mb-10">
                  <Button
                    id="load-more"
                    bsStyle="primary"
                    disabled={this.state.loading}
                    onClick={this.loadMore}>
                    <FormattedMessage id={relay.isLoading() ? 'global.loading' : 'global.more'} />
                  </Button>
                </div>
              )}
            </ListGroupFlush>
          )}
          <Modal.Footer>
            <CloseButton label="global.close" onClose={this.closeModal} />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const container = injectIntl(UserInGroupModal);

export default createPaginationContainer(
  container,
  {
    group: graphql`
      fragment UserInGroupModal_group on Group
        @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        id
        title
        users(first: $count, after: $cursor) @connection(key: "UserInGroupModal_users") {
          edges {
            cursor
            node {
              id
              media {
                id
                name
                size
                url
              }
              url
              username
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.group && props.group.users;
    },
    getFragmentVariables(previousVariables, totalCount) {
      return {
        ...previousVariables,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }) {
      return {
        count,
        cursor,
        groupId: props.group.id,
      };
    },
    query: graphql`
      query UserInGroupModalQuery($groupId: ID!, $count: Int!, $cursor: String) {
        group: node(id: $groupId) {
          ...UserInGroupModal_group @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
