// @flow
import * as React from 'react';
import { Field, reduxForm, submit } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import component from '~/components/Form/Field';
import UserAvatar from '~/components/User/UserAvatar';
import type { RegisterForm_user } from '~relay/RegisterForm_user.graphql';
import type { RegisterForm_event } from '~relay/RegisterForm_event.graphql';
import type { Dispatch } from '~/types';
import SubmitButton from '~/components/Form/SubmitButton';
import { FormContainer, UserInfo } from './RegisterForm.style';
import SubscribeToEventAsRegisteredMutation from '~/mutations/SubscribeToEventAsRegisteredMutation';
import SubscribeToEventAsNonRegisteredMutation from '~/mutations/SubscribeToEventAsNonRegisteredMutation';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';

const formName = 'RegisterFormEvent';

type Props = {|
  ...ReduxFormFormProps,
  user?: RegisterForm_user,
  event: RegisterForm_event,
|};

type Values = {|
  privacyPolicy: boolean,
|};

const validate = ({ privacyPolicy }: Values) => {
  const errors = {};

  if (!privacyPolicy) {
    errors.privacyPolicy = 'global.required';
  }

  return errors;
};

const onSubmit = (values, dispatch: Dispatch, props: Props) => {
  if (props.user) {
    const input = {
      eventId: props.event.id,
      private: values.private,
    };

    return SubscribeToEventAsRegisteredMutation.commit({
      input,
      isAuthenticated: true,
    })
      .then(() => {
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.SUCCESS,
            content: 'event_registration.create.register_success',
          },
        });
      })
      .catch(() => {
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.ERROR,
            content: 'global.error.server.form',
          },
        });
      });
  }

  const input = {
    eventId: props.event.id,
    email: values.email,
    username: values.username,
    private: values.private,
  };

  return SubscribeToEventAsNonRegisteredMutation.commit({
    input,
    isAuthenticated: false,
  })
    .then(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.SUCCESS,
          content: 'event_registration.create.register_success',
        },
      });
      props.reset();
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'global.error.server.form',
        },
      });
    });
};

export const RegisterForm = ({
  user,
  event,
  dispatch,
  handleSubmit,
  invalid,
  pristine,
  submitting,
}: Props) => {
  return (
    <FormContainer onSubmit={handleSubmit} id={formName}>
      {user ? (
        <UserInfo>
          <UserAvatar user={user} /> {user.username}
        </UserInfo>
      ) : (
        <>
          <Field
            type="text"
            name="username"
            id="username"
            label={<FormattedMessage id="global.name" />}
            component={component}
          />

          <Field
            type="text"
            name="email"
            id="email"
            label={<FormattedMessage id="global.email" />}
            component={component}
          />
        </>
      )}

      <div>
        <Field type="checkbox" name="private" id="private" component={component}>
          <FormattedMessage id="make-my-registration-anonymous" />
        </Field>

        <Field type="checkbox" name="privacyPolicy" id="privacyPolicy" component={component}>
          <FormattedHTMLMessage
            id={
              event.adminAuthorizeDataTransfer
                ? 'privacy-policy-accepted-2'
                : 'privacy-policy-accepted'
            }
          />
        </Field>
      </div>

      <SubmitButton
        label="event_registration.create.register"
        onSubmit={() => dispatch(submit(formName))}
        bsStyle="success"
        disabled={pristine || invalid || submitting}
      />
    </FormContainer>
  );
};

const form = reduxForm({
  validate,
  onSubmit,
  form: formName,
})(RegisterForm);

export default createFragmentContainer(form, {
  user: graphql`
    fragment RegisterForm_user on User {
      username
      ...UserAvatar_user
    }
  `,
  event: graphql`
    fragment RegisterForm_event on Event {
      id
      adminAuthorizeDataTransfer
    }
  `,
});
