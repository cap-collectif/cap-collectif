// @flow
import { submit, change, SubmissionError } from 'redux-form';
import Fetcher from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import type { Dispatch, Action } from '../../types';

export type State = {
  showLoginModal: boolean,
  showRegistrationModal: boolean,
  isSubmittingAccountForm: boolean,
  showConfirmPasswordModal: boolean,
  confirmationEmailResent: boolean,
  user: ?{
    id: string,
    username: string,
    isEmailConfirmed: boolean,
    isPhoneConfirmed: boolean,
    phone: string,
    isAdmin: boolean,
    email: string,
    newEmailToConfirm: ?string,
    media: ?{
        url: string
    },
    displayName: string,
    uniqueId: string
  }
};

type CloseRegistrationModalAction = { type: 'CLOSE_REGISTRATION_MODAL' };
type ShowRegistrationModalAction = { type: 'SHOW_REGISTRATION_MODAL' };
type CloseLoginModalAction = { type: 'CLOSE_LOGIN_MODAL' };
type ShowLoginModalAction = { type: 'SHOW_LOGIN_MODAL' };
type UserRequestEmailChangeAction = { type: 'USER_REQUEST_EMAIL_CHANGE', email: string };
type StartSubmittingAccountFormAction = { type: 'SUBMIT_ACCOUNT_FORM' };
type StopSubmittingAccountFormAction = { type: 'STOP_SUBMIT_ACCOUNT_FORM' };
type CancelEmailChangeSucceedAction = { type: 'CANCEL_EMAIL_CHANGE' };
type ConfirmPasswordAction = { type: 'SHOW_CONFIRM_PASSWORD_MODAL' };
export type SubmitConfirmPasswordAction = { type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password: string };
type CloseConfirmPasswordModalAction = { type: 'CLOSE_CONFIRM_PASSWORD_MODAL' };
export type UserAction =
    ShowRegistrationModalAction |
    CloseRegistrationModalAction |
    ShowLoginModalAction |
    CloseLoginModalAction |
    StartSubmittingAccountFormAction |
    ConfirmPasswordAction |
    StopSubmittingAccountFormAction |
    CancelEmailChangeSucceedAction |
    CloseConfirmPasswordModalAction |
    UserRequestEmailChangeAction |
    SubmitConfirmPasswordAction
;

const initialState : State = {
  showLoginModal: false,
  showRegistrationModal: false,
  isSubmittingAccountForm: false,
  confirmationEmailResent: false,
  showConfirmPasswordModal: false,
  user: null,
};

export const showRegistrationModal = (): ShowRegistrationModalAction => ({ type: 'SHOW_REGISTRATION_MODAL' });
export const closeRegistrationModal = (): CloseRegistrationModalAction => ({ type: 'CLOSE_REGISTRATION_MODAL' });
export const closeLoginModal = (): CloseLoginModalAction => ({ type: 'CLOSE_LOGIN_MODAL' });
export const showLoginModal = (): ShowLoginModalAction => ({ type: 'SHOW_LOGIN_MODAL' });
export const confirmPassword = (): ConfirmPasswordAction => ({ type: 'SHOW_CONFIRM_PASSWORD_MODAL' });
export const closeConfirmPasswordModal = (): CloseConfirmPasswordModalAction => ({ type: 'CLOSE_CONFIRM_PASSWORD_MODAL' });
export const startSubmittingAccountForm = (): StartSubmittingAccountFormAction => ({ type: 'SUBMIT_ACCOUNT_FORM' });
export const stopSubmittingAccountForm = (): StopSubmittingAccountFormAction => ({ type: 'STOP_SUBMIT_ACCOUNT_FORM' });
export const userRequestEmailChange = (email: string): UserRequestEmailChangeAction => ({ type: 'USER_REQUEST_EMAIL_CHANGE', email });
export const cancelEmailChangeSucceed = (): CancelEmailChangeSucceedAction => ({ type: 'CANCEL_EMAIL_CHANGE' });
export const submitConfirmPasswordFormSucceed = (password: string): SubmitConfirmPasswordAction => ({ type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password });

export const login = (data: { username: string, password: string }, dispatch: Dispatch): Promise<*> => {
  return fetch(`${window.location.protocol}//${window.location.host}/login_check`, {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
  .then(response => response.json())
  .then((response: { success: boolean }) => {
    if (response.success) {
      dispatch(closeLoginModal());
      window.location.reload();
      return true;
    }
    throw new SubmissionError({ _error: 'global.login_failed' });
  });
};

export const register = (values: Object, dispatch: Dispatch) => {
  const form = { ...values };
  delete form.charte;
  const responses = [];
  const apiForm = {};
  Object.keys(form).map((key) => {
    if (key.startsWith('dynamic-')) {
      const question = key.split('-')[1];
      if (typeof form[key] !== 'undefined' && form[key].length > 0) {
        responses.push({
          question,
          value: form[key],
        });
      }
    } else {
      apiForm[key] = form[key];
    }
  });
  if (responses.length) {
    apiForm.responses = responses;
  }
  return Fetcher
  .post('/users', apiForm)
  .then(() => {
    FluxDispatcher.dispatch({
      actionType: 'UPDATE_ALERT',
      alert: { bsStyle: 'success', content: 'alert.success.add.user' },
    });
    login({ username: values.email, password: values.plainPassword }, dispatch);
    dispatch(closeRegistrationModal());
  })
  .catch((error) => {
    const response = error.response;
    const errors: Object = { _error: 'Registration failed !' };
    window.grecaptcha.reset();
    dispatch(change('registration-form', 'captcha', null));
    if (response.errors) {
      const children = response.errors.children;
      if (children.email.errors && children.email.errors.length > 0) {
        children.email.errors.map((string) => {
          if (string === 'already_used_email') {
            errors.email = 'registration.constraints.email.already_used';
          } else {
            errors.email = `registration.constraints.${string}`;
          }
        });
      }
      if (children.captcha.errors && children.captcha.errors.length > 0) {
        errors.captcha = 'registration.constraints.captcha.invalid';
      }
      throw new SubmissionError(errors);
    }
  });
};

export const submitConfirmPasswordForm = ({ password }: { password: string }, dispatch: Dispatch): void => {
  dispatch(submitConfirmPasswordFormSucceed(password));
  dispatch(closeConfirmPasswordModal());
  setTimeout((): void => {
    dispatch(submit('account'));
  }, 1000);
};

export const cancelEmailChange = (dispatch: Dispatch, previousEmail: string): void => {
  Fetcher
    .post('/account/cancel_email_change')
    .then(() => {
      dispatch(cancelEmailChangeSucceed());
      dispatch(change('account', 'email', previousEmail));
    });
};

const sendEmail = () => {
  FluxDispatcher.dispatch({
    actionType: UPDATE_ALERT,
    alert: { bsStyle: 'success', content: 'user.confirm.sent' },
  });
};

export const resendConfirmation = (): void => {
  Fetcher
    .post('/account/resend_confirmation_email')
    .then(sendEmail)
    .catch(sendEmail)
  ;
};

export const submitAccountForm = (values: Object, dispatch: Dispatch): Promise<*> => {
  dispatch(startSubmittingAccountForm());
  return Fetcher.put('/users/me', values)
    .then((): void => {
      dispatch(stopSubmittingAccountForm());
      dispatch(userRequestEmailChange(values.email));
    })
    .catch(({ response: { message, errors } }: { response: { message: string, errors: Array<Object>}}): void => {
      dispatch(stopSubmittingAccountForm());
      if (message === 'You must specify your password to update your email.') {
        throw new SubmissionError({ _error: 'user.confirm.wrong_password' });
      }
      if (message === 'Already used email.') {
        throw new SubmissionError({ _error: 'registration.constraints.email.already_used' });
      }
      if (message === 'Validation Failed.') {
        if (errors.children && errors.children.newEmailToConfirm && errors.children.newEmailToConfirm.errors && Array.isArray(errors.children.newEmailToConfirm.errors) && errors.children.newEmailToConfirm.errors[0]) {
          // $FlowFixMe
          throw new SubmissionError({ _error: `registration.constraints.${errors.children.newEmailToConfirm.errors[0]}` });
        }
      }
      throw new SubmissionError({ _error: 'global.error' });
    });
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'SHOW_REGISTRATION_MODAL':
      return { ...state, showRegistrationModal: true };
    case 'CLOSE_REGISTRATION_MODAL':
      return { ...state, showRegistrationModal: false };
    case 'SHOW_LOGIN_MODAL':
      return { ...state, showLoginModal: true };
    case 'CLOSE_LOGIN_MODAL':
      return { ...state, showLoginModal: false };
    case 'CANCEL_EMAIL_CHANGE':
      return { ...state, user: { ...state.user, newEmailToConfirm: null }, confirmationEmailResent: false };
    case 'SUBMIT_ACCOUNT_FORM':
      return { ...state, isSubmittingAccountForm: true };
    case 'STOP_SUBMIT_ACCOUNT_FORM':
      return { ...state, isSubmittingAccountForm: false };
    case 'USER_REQUEST_EMAIL_CHANGE':
      return { ...state, user: { ...state.user, newEmailToConfirm: action.email } };
    case 'SHOW_CONFIRM_PASSWORD_MODAL':
      return { ...state, showConfirmPasswordModal: true };
    case 'CLOSE_CONFIRM_PASSWORD_MODAL':
      return { ...state, showConfirmPasswordModal: false };
    default:
      return state;
  }
};
