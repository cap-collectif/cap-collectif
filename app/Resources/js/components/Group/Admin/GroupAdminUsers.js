// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ListGroup, ButtonToolbar, ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isValid, isInvalid, isSubmitting, hasSubmitSucceeded, hasSubmitFailed } from 'redux-form';
import type { GroupAdminUsers_group } from '~relay/GroupAdminUsers_group.graphql';
import AlertForm from '../../Alert/AlertForm';
import AlertFormSucceededMessage from '../../Alert/AlertFormSucceededMessage';
import GroupAdminUsersListGroupItem from './GroupAdminUsersListGroupItem';
import GroupAdminModalAddUsers from './GroupAdminModalAddUsers';
import GroupAdminModalImportUsers from './GroupAdminModalImportUsers';
import type { GlobalState } from '../../../types';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

type Props = {|
  ...ReduxFormFormProps,
  relay: RelayPaginationProp,
  group: GroupAdminUsers_group,
  userIsDeleted: boolean,
  userIsNotDeleted: boolean,
  intl: IntlShape,
|};

type State = {|
  showAddUsersModal: boolean,
  showImportUsersModal: boolean,
  loading: boolean,
|};

export const formName = 'group-admin-users';

export class GroupAdminUsers extends React.Component<Props, State> {
  state = {
    showAddUsersModal: false,
    showImportUsersModal: false,
    loading: false,
  };

  handleLoadMore = () => {
    this.setState({ loading: true });
    this.props.relay.loadMore(100, () => {
      this.setState({ loading: false });
    });
  };

  getAlertForm() {
    const {
      valid,
      invalid,
      submitting,
      submitSucceeded,
      submitFailed,
      userIsDeleted,
      userIsNotDeleted,
    } = this.props;

    if (userIsDeleted) {
      return (
        <div className="d-ib">
          <AlertFormSucceededMessage />
        </div>
      );
    }

    if (userIsNotDeleted) {
      return (
        <AlertForm
          valid={false}
          invalid={false}
          submitSucceeded={false}
          submitFailed
          submitting={false}
        />
      );
    }

    return (
      <AlertForm
        valid={valid}
        invalid={invalid}
        submitSucceeded={submitSucceeded}
        submitFailed={submitFailed}
        submitting={submitting}
      />
    );
  }

  openCreateModal = () => {
    this.setState({ showAddUsersModal: true });
  };

  openImportModal = () => {
    this.setState({ showImportUsersModal: true });
  };

  handleClose = () => {
    this.setState({ showAddUsersModal: false, showImportUsersModal: false });
  };

  render() {
    const { group, intl, relay } = this.props;
    const { showAddUsersModal, showImportUsersModal, loading } = this.state;
    return (
      <div className="box box-primary container-fluid">
        <div className="box-header  pl-0">
          <h3 className="box-title">
            <FormattedMessage id="group.admin.users" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.addGroup.link' })}>
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <div className="box-content">
          <ButtonToolbar>
            <Button bsStyle="success" onClick={this.openCreateModal}>
              <i className="fa fa-plus-circle" /> <FormattedMessage id="group-admin-add-members" />
            </Button>
            <Button bsStyle="success" onClick={this.openImportModal}>
              <i className="fa fa-upload" />{' '}
              <FormattedMessage id="group-admin-add-members-via-file" />
            </Button>
          </ButtonToolbar>
          {this.getAlertForm()}
          <GroupAdminModalAddUsers
            show={showAddUsersModal}
            onClose={this.handleClose}
            group={group}
          />
          {/* $FlowFixMe please use mapDispatchToProps */}
          <GroupAdminModalImportUsers
            show={showImportUsersModal}
            onClose={this.handleClose}
            group={group}
          />
          {group.users.edges ? (
            <ListGroup className="mt-15">
              {group.users.edges
                .map(edge => edge && edge.node)
                // https://stackoverflow.com/questions/44131502/filtering-an-array-of-maybe-nullable-types-in-flow-to-remove-null-values
                .filter(Boolean)
                .map(user => (
                  <GroupAdminUsersListGroupItem key={user.id} user={user} groupId={group.id} />
                ))}
            </ListGroup>
          ) : (
            <div className="mb-15">
              <FormattedMessage id="group.admin.no_users" />
            </div>
          )}
          {relay.hasMore() && (
            <ListGroupItem style={{ textAlign: 'center' }}>
              {loading ? (
                <Loader />
              ) : (
                <Button bsStyle="link" onClick={this.handleLoadMore}>
                  <FormattedMessage id="global.more" />
                </Button>
              )}
            </ListGroupItem>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  valid: isValid('group-users-add')(state),
  invalid: isInvalid('group-users-add')(state),
  submitting: isSubmitting('group-users-add')(state),
  submitSucceeded: hasSubmitSucceeded('group-users-add')(state),
  submitFailed: hasSubmitFailed('group-users-add')(state),
  userIsDeleted: state.user.groupAdminUsersUserDeletionSuccessful,
  userIsNotDeleted: state.user.groupAdminUsersUserDeletionFailed,
});

const myComponent = injectIntl(GroupAdminUsers);

const container = connect(mapStateToProps)(myComponent);

export default createPaginationContainer(
  container,
  {
    group: graphql`
      fragment GroupAdminUsers_group on Group
        @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        id
        title
        users(first: $count, after: $cursor) @connection(key: "GroupAdminUsers_users") {
          edges {
            node {
              id
              ...GroupAdminUsersListGroupItem_user
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    // $FlowFixMe redux-form
    getConnectionFromProps(props: Props) {
      return props.group && props.group.users;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        groupId: props.group.id,
      };
    },
    query: graphql`
      query GroupAdminUsersQuery($groupId: ID!, $cursor: String, $count: Int!) {
        group: node(id: $groupId) {
          id
          ...GroupAdminUsers_group @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  },
);
