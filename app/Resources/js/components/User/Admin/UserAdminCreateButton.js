// @flow
import React, {Component} from 'react';
import {FormattedMessage, injectIntl, type IntlShape} from 'react-intl';
import {ButtonGroup, Button, Modal} from 'react-bootstrap';
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
import type {Dispatch} from "../../../types";
import SelectUserRoles from "../../Form/SelectUserRoles";

const formName = 'user-admin-create';

type Props = FormProps & {
  intl: IntlShape
};

type State = {
  showModal: boolean
};

type FormValues = {
  username: string,
  email: string,
  plainPassword: ?string,
  roles: {
    labels: []
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
    errors.email = 'registration.constraints.email.invalid';
  }
  if (values.plainPassword && values.plainPassword.length < 8) {
    errors.plainPassword = 'registration.constraints.password.min';
  }
  if (values.plainPassword && values.plainPassword.length > 72) {
    errors.plainPassword = 'registration.constraints.password.max';
  }
  if (values.roles && !values.roles.labels || values.roles && values.roles.labels.length === 0) {
    errors.roles = 'please-select-at-least-1-option';
  }

  return errors;
};

// if I give FormValues I got an error "cause of  object type [1] is incompatible
// with read-only array type [2] in property input.roles." So I give Object
const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const {intl} = props;
  const roles = values.roles.labels;
  // delete values.roles, because we need values.roles.labels as roles
  delete values.roles;
  const input = {
    ...values,
    roles
  };

  return CreateUserMutation.commit({input})
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
          _error: intl.formatMessage({id: 'global.error.server.form'}),
        });
      }
    });
};

export class UserAdminCreateButton extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

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
    const {showModal} = this.state;

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
              <SelectUserRoles
                id="user_roles"
                name="roles"
                label="form.label_real_roles"
              />
              <Field
                isOtherAllowed
                id="user_statuses"
                name="vip"
                component={component}
                type="checkbox"
                label={
                  <FormattedMessage id="admin.fields.step.statuses"/>
                }
                value="vip"
                children={<FormattedMessage id="form.label_vip"/>}
              />
              <Field
                id="user_statuses"
                name="enabled"
                component={component}
                type="checkbox"
                isOtherAllowed
                value="enabled"
                children={<FormattedMessage id="list.label_enabled"/>}
              />
              <Field
                id="user_statuses"
                name="locked"
                component={component}
                type="checkbox"
                value="locked"
                isOtherAllowed
                children={<FormattedMessage id="list.label_locked"/>}
              />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup className="pl-0 d-flex d-inline-block">
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
                id="confirm-user-create">
                <FormattedMessage
                  id={submitting ? 'global.loading' : 'global.save_modifications'}
                />
              </Button>
              <AlertForm
                valid={pristine ? true : valid}
                invalid={pristine ? false : invalid}
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

const userForm = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(UserAdminCreateButton);

export default (injectIntl(userForm));
