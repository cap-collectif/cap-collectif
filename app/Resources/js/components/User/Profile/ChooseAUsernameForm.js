// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, type FormProps } from 'redux-form';
import component from '../../Form/Field';
import UpdateProfileMutation from '../../../mutations/UpdateProfileMutation';

export const formName = 'choose-username';

const onSubmit = (values: Object) => {
  return UpdateProfileMutation.commit({ input: { username: values.username } }).then(() => {
    window.location.reload();
    return true;
  });
};

export class ChooseAUsernameForm extends React.Component<FormProps> {
  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          type="text"
          component={component}
          name="username"
          id="account__username"
          label={<FormattedMessage id="global.fullname" />}
        />
      </form>
    );
  }
}

export default reduxForm({ form: formName, onSubmit })(ChooseAUsernameForm);
