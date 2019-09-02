// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import component from '../../Form/Field';
import UpdateProfileMutation from '../../../mutations/UpdateProfileMutation';

export const formName = 'choose-username';

const onSubmit = (values: Object) =>
  UpdateProfileMutation.commit({ input: { username: values.username } }).then(() => {
    window.location.reload();
    return true;
  });

const validate = ({ username }: { username: ?string }) => {
  const errors = {};
  if (!username || username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  return errors;
};

export class ChooseAUsernameForm extends React.Component<ReduxFormFormProps> {
  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          type="text"
          component={component}
          name="username"
          id="account__username"
          help={
            <span>
              <FormattedMessage id="name-under-which-you-will-appear-on-the-site" />
            </span>
          }
          label={<FormattedMessage id="global.fullname" />}
        />
      </form>
    );
  }
}

export default reduxForm({ form: formName, validate, onSubmit })(ChooseAUsernameForm);
