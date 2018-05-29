// @flow
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {  ButtonGroup, Button, Modal} from 'react-bootstrap';
import {
  reduxForm,
  type FormProps,
  Field,
  SubmissionError,
} from 'redux-form';
import CloseButton from '../../Form/CloseButton';
import component from '../../Form/Field';
import CreateUserMutation from '../../../mutations/CreateUserMutation';
import {isEmail} from "../../../services/Validator";
import {form} from "../Registration/RegistrationForm";
import AlertForm from '../../Alert/AlertForm';


const formName = 'user-admin-create';

const validate = (values: Object) => {
  const errors = {};
  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (!values.email || !isEmail(values.email)) {
    errors.email = 'registration.constraints.email.invalid';
  }
  if (values.plainPassword && values.plainPassword.length < 8) {
    errors.plainPassword = 'registration.constraints.password.min';
  }
  if (values.plainPassword && values.plainPassword.length > 72) {
    errors.plainPassword = 'registration.constraints.password.max';
  }

  return errors;
};

const onSubmit = (values) => {
  return CreateUserMutation.commit({input: values}).then(() => {
    window.location.reload();
  });
};

type Props = FormProps & {};

export class UserAdminCreateButton extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
    } = this.props;
    const {showModal} = this.state;

    const userRoles = [
      {
        id: 'ROLE_SUPER_ADMIN',
        value: 'ROLE_SUPER_ADMIN',
        label:<FormattedMessage id="roles.super_admin" />,
      },
      {
        id: 'ROLE_ADMIN',
        value: 'ROLE_ADMIN',
        label: <FormattedMessage id="roles.admin" />,
      },
      {
        id: 'ROLE_USER',
        value: 'ROLE_USER',
        label: <FormattedMessage id="roles.user" />,
      }
    ];

    return (
      <div>
        <Button
          id="add-a-user"
          bsStyle="default"
          style={{marginTop: 10}}
          onClick={() => {
            this.setState({showModal: true});
          }}>
          <FormattedMessage id="add-a-user"/>
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({showModal: false});
          }}
          bsSize="medium"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="add-a-user"/>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
            <Field
                name="username"
                id="username"
                component={component}
                type="text"
                label={<FormattedMessage id="registration.username"/>}
              />
              <Field
                name="email"
                id="email"
                component={component}
                type="email"
                label={<FormattedMessage id="global.email"/>}
              />
              <Field
                name="plainPassword"
                id="password"
                component={component}
                type="password"
                label={<FormattedMessage id="registration.password"/>}
              />
              <Field
                id="user_roles"
                name="roles"
                component={component}
                type="checkbox"
                label={
                  <FormattedMessage id="form.label_real_roles"/>
                }
                choices={userRoles}
              >
              </Field>
              <Field
                id="user_statuses"
                name="vip"
                component={component}
                type="checkbox"
                label={
                  <FormattedMessage id="admin.fields.step.statuses"/>
                }
                value="vip"
                children={<FormattedMessage id="form.label_vip" />}
              />
              <Field
                id="user_statuses"
                name="enabled"
                component={component}
                type="checkbox"
                value="enabled"
                children={<FormattedMessage id="list.label_enabled" />}
              />
              <Field
                id="user_statuses"
                name="locked"
                component={component}
                type="checkbox"
                value="locked"
                children={<FormattedMessage id="list.label_locked" />}
              />
          </form>
        </Modal.Body>
          <Modal.Footer>
            <ButtonGroup className="col-sm-4 pl-0">
              <CloseButton
                onClose={() => {
                  this.setState({showModal: false});
                }}
              />
              <Button
                disabled={invalid || submitting}
                type="submit"
                bsStyle="primary"
                onClick={handleSubmit}
                id="personal-data-form-save">
                <FormattedMessage
                  id={submitting ? 'global.loading' : 'global.save_modifications'}
                />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                errorMessage={error}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonGroup>
          </Modal.Footer>
      </Modal>
      </div>
    );
  }
}

export default reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(UserAdminCreateButton);
