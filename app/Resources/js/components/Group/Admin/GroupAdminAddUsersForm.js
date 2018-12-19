// @flow
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { fetchQuery, graphql } from 'react-relay';
import type { Dispatch } from '../../../types';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import { groupAdminUsersUserDeletionReset } from '../../../redux/modules/user';
import AddUsersInGroupMutation from '../../../mutations/AddUsersInGroupMutation';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';

type Props = {
  group: GroupAdminUsers_group,
  handleSubmit: Function,
  // eslint-disable-next-line react/no-unused-prop-types
  dispatch: Dispatch,
  // eslint-disable-next-line react/no-unused-prop-types
  onClose: Function,
};

type DefaultProps = void;
type FormValues = {
  users: Array<Object>,
};

const getUsersList = graphql`
  query GroupAdminAddUsersFormUsersListQuery($notInIds: [String], $displayName: String) {
    userSearch(notInIds: $notInIds, displayName: $displayName) {
      id
      displayName
    }
  }
`;

export const formName = 'group-users-add';

const onSubmit = (values: FormValues, dispatch: Dispatch, { group, onClose, reset }) => {
  const users = [];

  dispatch(groupAdminUsersUserDeletionReset());

  values.users.map(user => {
    users.push(user.value);
  });

  const variables = {
    input: {
      users,
      groupId: group.id,
    },
  };

  return AddUsersInGroupMutation.commit(variables).then(() => {
    reset();
    onClose();
  });
};

export class GroupAdminAddUsersForm extends React.Component<Props> {
  static defaultProps: DefaultProps;

  render() {
    const { handleSubmit, group } = this.props;

    const usersInGroup = [];
    group.users.edges.map(edge => {
      usersInGroup.push(edge.node.id);
    });

    const retrieveUsersList = (usersIds: Array<string>, terms: ?string) =>
      fetchQuery(environment, getUsersList, {
        notInIds: usersIds,
        displayName: terms,
      }).then(data => ({
        options: data.userSearch.map(u => ({
          value: u.id,
          label: u.displayName,
        })),
      }));

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <Field
            name="users"
            label={<FormattedMessage id="group.admin.form.users" />}
            id="group-users-users"
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            component={select}
            clearable
            multi
            autoload
            loadOptions={terms => retrieveUsersList(usersInGroup, terms)}
          />
        </div>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
  destroyOnUnmount: false,
})(GroupAdminAddUsersForm);

export default injectIntl(form);
