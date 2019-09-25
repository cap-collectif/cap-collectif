// @flow
import React from 'react';
import { Modal, ListGroupItem, Button } from 'react-bootstrap';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import type { UserGroupModal_project } from '~relay/UserGroupModal_project.graphql';
import UserInGroupModal from './UserInGroupModal';
import CloseButton from '../../Form/CloseButton';
import GroupAvatar from '../../User/GroupAvatar';
import ListGroupFlush from '../../Ui/List/ListGroupFlush';
import type { Uuid } from '../../../types';

type RelayProps = {|
  project: UserGroupModal_project,
|};

type Props = {|
  ...RelayProps,
  show: boolean,
  handleClose: () => void,
  relay: RelayPaginationProp,
  intl: IntlShape,
|};
type State = {
  currentShownGroupModalId: ?string,
  loading: boolean,
};

export class UserGroupModal extends React.Component<Props, State> {
  state = {
    currentShownGroupModalId: null,
    loading: false,
  };

  closeModal = () => {
    this.props.handleClose();
  };

  closeUserInGroupModal = () => {
    this.setState({ currentShownGroupModalId: null });
  };

  loadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(10, () => {
      this.setState({ loading: false });
    });
  };

  handleClick = (groupId: Uuid) => {
    this.setState({ currentShownGroupModalId: groupId });
  };

  render() {
    const { show, project, relay, intl } = this.props;
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={this.closeModal}
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <b>
                <FormattedMessage id="people-with-access-to-project" />
              </b>
            </Modal.Title>
          </Modal.Header>
          {project.restrictedViewers &&
            project.restrictedViewers.edges &&
            project.restrictedViewers.edges.length > 0 && (
              <ListGroupFlush className="d-flex text-left">
                {project.restrictedViewers.edges
                  .filter(Boolean)
                  .map(edge => edge && edge.node)
                  .filter(Boolean)
                  .map(group => (
                    <ListGroupItem key={group.id} id={group.id}>
                      <GroupAvatar size={35} />
                      <Button
                        bsStyle="link"
                        className="btn-md p-0"
                        onClick={() => {
                          this.handleClick(group.id);
                        }}
                        title={intl.formatMessage(
                          { id: 'persons-in-the-group' },
                          { groupName: group.title },
                        )}>
                        {group.title}
                      </Button>
                      <UserInGroupModal
                        group={group}
                        show={this.state.currentShownGroupModalId === group.id}
                        handleClose={this.closeUserInGroupModal}
                      />
                    </ListGroupItem>
                  ))}
                {relay.hasMore() && (
                  <div className="text-center">
                    <Button bsStyle="primary" onClick={this.loadMore} disabled={this.state.loading}>
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

const container = injectIntl(UserGroupModal);

export default createPaginationContainer(
  container,
  {
    project: graphql`
      fragment UserGroupModal_project on Project
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 10 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        restrictedViewers(first: $count, after: $cursor)
          @connection(key: "UserGroupModal_restrictedViewers") {
          edges {
            cursor
            node {
              id
              title
              ...UserInGroupModal_group
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
      return props.project && props.project.restrictedViewers;
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
        projectId: props.project.id,
      };
    },
    query: graphql`
      query UserGroupModalQuery($projectId: ID!, $count: Int!, $cursor: String) {
        project: node(id: $projectId) {
          ...UserGroupModal_project @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
