// @flow
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import type { Dispatch } from '../../../types';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import AddUsersInGroupMutation from '../../../mutations/AddUsersInGroupMutation';
import Fetcher from '../../../services/Fetcher';
import select from '../../Form/Select';

type Props = {
  group: GroupAdminUsers_group,
  handleSubmit: Function,
  dispatch: Dispatch,
};

type DefaultProps = void;
type FormValues = {
  users: Array<Object>,
};

export const formName = 'group-users-add';

const onSubmit = (values: FormValues, dispatch: Dispatch, { group }: Props) => {
  const users = [];

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
    window.location.reload();
  });
};

export class GroupAdminAddUsersForm extends React.Component<Props> {
  static defaultProps: DefaultProps;

  render() {
    const { handleSubmit, group } = this.props;

    const usersInGroup = [];
    group.usersConnection.edges.map(edge => {
      usersInGroup.push(edge.node.id);
    });

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
            loadOptions={terms =>
              Fetcher.postToJson(`/users/search`, { terms, notInIds: usersInGroup }).then(res => ({
                options: res.users.map(u => ({
                  value: u.id,
                  label: u.displayName,
                })),
              }))}
          />
        </div>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
})(GroupAdminAddUsersForm);

export default injectIntl(form);
