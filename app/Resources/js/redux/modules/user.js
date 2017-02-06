// @flow
import { submit, change, SubmissionError } from 'redux-form';
import Fetcher from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import type { Dispatch, Action } from '../../types';

export type State = {
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

type UserRequestEmailChangeAction = { type: 'USER_REQUEST_EMAIL_CHANGE', email: string };
type StartSubmittingAccountFormAction = { type: 'SUBMIT_ACCOUNT_FORM' };
type StopSubmittingAccountFormAction = { type: 'STOP_SUBMIT_ACCOUNT_FORM' };
type CancelEmailChangeSucceedAction = { type: 'CANCEL_EMAIL_CHANGE' };
type ConfirmPasswordAction = { type: 'SHOW_CONFIRM_PASSWORD_MODAL' };
export type SubmitConfirmPasswordAction = { type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password: string };
type CloseConfirmPasswordModalAction = { type: 'CLOSE_CONFIRM_PASSWORD_MODAL' };
export type UserAction =
    StartSubmittingAccountFormAction
  | ConfirmPasswordAction
  | CloseConfirmPasswordModalAction
  | UserRequestEmailChangeAction
;

const initialState = {
  isSubmittingAccountForm: false,
  confirmationEmailResent: false,
  showConfirmPasswordModal: false,
  user: null,
};

export const confirmPassword = (): ConfirmPasswordAction => ({ type: 'SHOW_CONFIRM_PASSWORD_MODAL' });
export const closeConfirmPasswordModal = (): CloseConfirmPasswordModalAction => ({ type: 'CLOSE_CONFIRM_PASSWORD_MODAL' });
const startSubmittingAccountForm = (): StartSubmittingAccountFormAction => ({ type: 'SUBMIT_ACCOUNT_FORM' });
const stopSubmittingAccountForm = (): StopSubmittingAccountFormAction => ({ type: 'STOP_SUBMIT_ACCOUNT_FORM' });
const userRequestEmailChange = (email: string): UserRequestEmailChangeAction => ({ type: 'USER_REQUEST_EMAIL_CHANGE', email });
const cancelEmailChangeSucceed = (): CancelEmailChangeSucceedAction => ({ type: 'CANCEL_EMAIL_CHANGE' });

export const submitConfirmPasswordForm = ({ password }: { password: string }, dispatch: Dispatch): void => {
  dispatch({ type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password });
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

export const resendConfirmation = (): void => {
  const sendEmail = () => {
    FluxDispatcher.dispatch({
      actionType: UPDATE_ALERT,
      alert: { bsStyle: 'success', content: 'user.confirm.sent' },
    });
  };
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
    .catch(({ response }): void => {
      dispatch(stopSubmittingAccountForm());
      if (response.message === 'You must specify your password to update your email.') {
        throw new SubmissionError({ _error: 'user.confirm.wrong_password' });
      }
      throw new SubmissionError({ _error: 'user.confirm.wrong_password' });
    });
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'CANCEL_EMAIL_CHANGE':
      return { ...state, user: { ...state.user, newEmailToConfirm: null, confirmationEmailResent: false } };
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
