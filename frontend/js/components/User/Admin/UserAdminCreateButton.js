// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import styled, {type StyledComponent} from 'styled-components';
import CloseButton from '../../Form/CloseButton';
import component from '../../Form/Field';
import CreateUserMutation from '../../../mutations/CreateUserMutation';
import { isEmail } from '../../../services/Validator';
import { form } from '../Registration/RegistrationForm';
import AlertForm from '../../Alert/AlertForm';
import type { Dispatch } from '../../../types';
import SelectUserRole from '../../Form/SelectUserRole';
import { type UserRole } from '~relay/CreateUserMutation.graphql';
import UserPasswordField from "~/components/User/UserPasswordField";
import {asyncPasswordValidate} from "~/components/User/UserPasswordComplexityUtils";

const formName = 'user-admin-create';

const FooterButtons: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: inline-box;
  .right-buttons {
    display: flex;
  }
  button{
    border-radius: 4px;
  }
  #confirm-user-create{
    margin-left: 15px;
  }

`;

const FooterContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .modal-footer{
    display: flex;
    flex: 1;
  }
  .d-ib{
    margin: 0 auto;
  }
`;

type Props = {|
  ...ReduxFormFormProps,
  intl: IntlShape,
|};

type State = {
  showModal: boolean,
};

type FormValues = {
  username: string,
  email: string,
  plainPassword: ?string,
  // $FlowFixMe
  roles: {
    // Cannot call CreateUserMutation.commit with object literal bound to variables because object type [1] is incompatible
    // with read-only array type [2] in property input.roles.
    labels: [UserRole],
  },
  vip: boolean,
  enabled: boolean,
  locked: boolean,
};

const validate = (values: FormValues) => {
  const errors = {};
  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (!values.email || !isEmail(values.email)) {
    errors.email = 'global.constraints.email.invalid';
  }
  if (values.plainPassword && values.plainPassword.length > 72) {
    errors.plainPassword = 'registration.constraints.password.max';
  }
  if (
    (values.roles && !values.roles.labels) ||
    (values.roles && values.roles.labels.length === 0)
  ) {
    errors.roles = 'please-select-at-least-1-option';
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  const input = {
    ...values,
    roles: values.roles.labels,
  };

  return CreateUserMutation.commit({ input })
    .then(response => {
      if (!response.createUser || !response.createUser.user) {
        throw new Error('Mutation "createUser" failed.');
      }

      window.location.href = `/admin/capco/user/user/${response.createUser.user.id}/edit`;
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

export class UserAdminCreateButton extends Component<Props, State> {
  state = {
    showModal: false,
  };

  render() {
    const {
      invalid,
      valid,
      pristine,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
    } = this.props;
    const { showModal } = this.state;

    return (
      <div>
        <Button
          id="add-a-user-button"
          bsStyle="default"
          style={{ marginTop: 10 }}
          onClick={() => {
            this.setState({ showModal: true });
          }}>
          <div id="add-a-user">
            <FormattedMessage id="add-a-user" />
          </div>
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="add-a-user" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <Field
                name="username"
                id="username"
                component={component}
                type="text"
                label={<FormattedMessage id='global.fullname' />}
              />
              <Field
                name="email"
                id="email"
                component={component}
                type="email"
                label={<FormattedMessage id="global.email" />}
              />
              <UserPasswordField
                formName={form}
                id="password"
                name="plainPassword"
                ariaRequired
                label={<FormattedMessage id="registration.password" />}
                labelClassName="font-weight-normal"
              />
              <SelectUserRole id="user_roles" name="roles" label="form.label_real_roles" />
              <Field
                isOtherAllowed
                id="vip"
                name="vip"
                component={component}
                type="checkbox"
                label={<FormattedMessage id='admin.fields.step.group_statuses' />}
                value="vip"
                children={<FormattedMessage id="form.label_vip" />}
              />
              <Field
                id="enabled"
                name="enabled"
                component={component}
                type="checkbox"
                isOtherAllowed
                value="enabled"
                children={<FormattedMessage id="list.label_enabled" />}
              />
              <Field
                id="locked"
                name="locked"
                component={component}
                type="checkbox"
                value="locked"
                isOtherAllowed
                children={<FormattedMessage id="list.label_locked" />}
              />
            </form>
          </Modal.Body>
          <FooterContainer>
            <Modal.Footer>
              <AlertForm
                valid={pristine ? true : valid}
                invalid={pristine ? false : invalid}
                errorMessage={error}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
              <FooterButtons>
                <div className="pl-0 d-flex d-inline-block right-buttons">
                  <CloseButton
                    onClose={() => {
                      this.setState({ showModal: false });
                    }}
                  />
                  <Button
                    disabled={invalid || submitting}
                    type="submit"
                    bsStyle="primary"
                    onClick={handleSubmit}
                    id="confirm-user-create">
                    <FormattedMessage id={submitting ? 'global.loading' : 'global.add'} />
                  </Button>
                </div>
              </FooterButtons>
            </Modal.Footer>
          </FooterContainer>

        </Modal>
      </div>
    );
  }
}

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  return asyncPasswordValidate(form, 'plainPassword', values, dispatch);
};
const userForm = reduxForm({
  onSubmit,
  validate,
  asyncValidate,
  enableReinitialize: true,
  form: formName,
})(UserAdminCreateButton);

export default injectIntl(userForm);
