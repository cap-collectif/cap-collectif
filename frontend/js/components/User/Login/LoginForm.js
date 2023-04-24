// @flow
import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Field, formValueSelector, isSubmitting, reduxForm } from 'redux-form';
import { Alert } from 'react-bootstrap';
import renderInput from '../../Form/Field';
import { login as onSubmit } from '../../../redux/modules/user';
import type { GlobalState } from '~/types';

type ReduxProps = {|
  +restrictConnection: boolean,
  +displayCaptcha: boolean,
  +error?: string,
  +submitting: boolean,
|};

type State = {|
  error: ?string,
|};

type Props = {|
  ...ReduxProps,
|};

export const formName = 'login';

export class LoginForm extends React.Component<Props, State> {
  static defaultProps = {
    displayCaptcha: false,
  };

  captchaRef: any;

  constructor(props: Props) {
    super(props);
    this.captchaRef = React.createRef();
  }

  state = {
    error: null,
  };

  componentDidUpdate(prevProps: Props) {
    const { submitting, error } = this.props;
    if (prevProps.submitting && submitting === false) {
      // https://reactjs.org/docs/react-component.html#componentdidupdate
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error });
    }
    if (error === 'your-email-address-or-password-is-incorrect') {
      if (this.captchaRef) {
        // eslint-disable-next-line no-unused-expressions
        this.captchaRef?.current?.reset();
      }
    }
  }

  render() {
    const { error } = this.state;
    const { displayCaptcha, restrictConnection } = this.props;
    return (
      <div className="form_no-bold-label">
        {error && (
          <Alert bsStyle="danger">
            <div className="font-weight-bold">
              <span id="login-error">
                <FormattedHTMLMessage id={error} />
              </span>
            </div>
            {error === 'your-email-address-or-password-is-incorrect' ? (
              <FormattedMessage id="try-again-or-click-on-forgotten-password-to-reset-it" />
            ) : null}
          </Alert>
        )}
        <Field
          name="username"
          type="email"
          autoFocus
          ariaRequired
          id="username"
          label={<FormattedMessage id="global.email" />}
          autoComplete="email"
          labelClassName="font-weight-normal"
          component={renderInput}
        />
        <Field
          name="password"
          type="password"
          ariaRequired
          id="password"
          label={<FormattedMessage id="global.password" />}
          labelClassName="w-100 font-weight-normal"
          autoComplete="off"
          component={renderInput}
        />
        <a href="/resetting/request">
          <FormattedMessage id="global.forgot_password" />
        </a>

        <Field
          disabled={!restrictConnection || !displayCaptcha}
          id="captcha"
          component={renderInput}
          name="captcha"
          type="captcha"
          captchaRef={this.captchaRef}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  displayCaptcha: formValueSelector(formName)(state, 'displayCaptcha'),
  restrictConnection: state.default.features.restrict_connection,
  submitting: isSubmitting(formName)(state),
});

const validate = (values: { username: string, password: string, new_password: string }) => {
  const errors = {};
  if (
    !values.username ||
    values.username.length < 1 ||
    !values.new_password ||
    values.new_password.length < 1
  ) {
    errors._error = 'your-email-address-or-password-is-incorrect';
  }
  return errors;
};

const container = reduxForm({
  initialValues: {
    username: '',
    password: '',
    captcha: null,
    displayCaptcha: false,
  },
  onSubmit,
  validate,
  form: formName,
  destroyOnUnmount: false,
  persistentSubmitErrors: true,
})(LoginForm);

export default connect<any, any, _, _, _, _>(mapStateToProps)(container);
