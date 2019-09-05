// @flow
import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import {Field, formValueSelector, isSubmitting, reduxForm} from 'redux-form';
import { Alert } from 'react-bootstrap';
import styled from 'styled-components';
import renderInput from '../../Form/Field';
import { login as onSubmit } from '../../../redux/modules/user';
import type { GlobalState } from '../../../types';

const StyledContainer = styled.div`
  .hide-captcha {
    display: none;
  }
`;

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
            <FormattedMessage id="try-again-or-click-on-forgotten-password-to-reset-it" />
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
          // Prevent google from completing password when there is an error
          autoComplete={error ? undefined : 'current-password'}
          component={renderInput}
        />
        <a href="/resetting/request">{<FormattedMessage id="global.forgot_password" />}</a>

        <StyledContainer>
          <div className={restrictConnection && displayCaptcha ? '' : 'hide-captcha'}>
            <Field id="captcha" component={renderInput} name="captcha" type="captcha" />
          </div>
        </StyledContainer>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  displayCaptcha: formValueSelector(formName)(state, 'displayCaptcha'),
  restrictConnection: state.default.features.restrict_connection,
  submitting: isSubmitting(formName)(state),
});

const container = reduxForm({
  initialValues: {
    username: '',
    password: '',
    captcha: null,
    displayCaptcha: false,
  },
  onSubmit,
  form: formName,
  destroyOnUnmount: true,
  persistentSubmitErrors: true,
})(LoginForm);

export default connect(mapStateToProps)(container);
