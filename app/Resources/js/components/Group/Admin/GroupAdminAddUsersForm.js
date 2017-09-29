// @flow
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import GroupAdminUsers_group from './__generated__/GroupAdminUsers_group.graphql';
import Fetcher from '../../../services/Fetcher';
import select from '../../Form/Select';

type Props = {
  group: GroupAdminUsers_group,
  handleSubmit: Function,
};

type DefaultProps = void;

const formName = 'group-users-add';

export class GroupAdminAddUsersForm extends React.Component<Props> {
  static defaultProps: DefaultProps;

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="users"
          label="Utilisateur(s)"
          id="group-users-users"
          labelClassName="control-label"
          inputClassName="fake-inputClassName"
          component={select}
          clearable
          autoload
          loadOptions={terms =>
            Fetcher.postToJson(`/users/search`, { terms }).then(res => ({
              options: res.users.map(u => ({
                value: u.id,
                label: u.displayName,
              })),
            }))}
        />
      </form>
    );
  }
}

const form = reduxForm({
  form: formName,
})(GroupAdminAddUsersForm);

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(GroupAdminAddUsersForm);
