// @flow
import type { Dispatch } from 'redux';
import { submit } from 'redux-form';
import Fetcher from '../../services/Fetcher';

type State = {
  isSubmittingAccountForm: boolean,
  showConfirmPasswordModal: boolean,
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
type ConfirmPasswordAction = { type: 'SHOW_CONFIRM_PASSWORD_MODAL' };
export type SubmitConfirmPasswordAction = { type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password: string };
type CloseConfirmPasswordModalAction = { type: 'CLOSE_CONFIRM_PASSWORD_MODAL' };
type Action =
    StartSubmittingAccountFormAction
  | ConfirmPasswordAction
  | CloseConfirmPasswordModalAction
  | UserRequestEmailChangeAction
;

const initialState = {
  isSubmittingAccountForm: false,
  showConfirmPasswordModal: false,
  user: null,
};

export const confirmPassword = (): ConfirmPasswordAction => ({ type: 'SHOW_CONFIRM_PASSWORD_MODAL' });
export const closeConfirmPasswordModal = (): CloseConfirmPasswordModalAction => ({ type: 'CLOSE_CONFIRM_PASSWORD_MODAL' });
const startSubmittingAccountForm = (): StartSubmittingAccountFormAction => ({ type: 'SUBMIT_ACCOUNT_FORM' });
const stopSubmittingAccountForm = (): StopSubmittingAccountFormAction => ({ type: 'STOP_SUBMIT_ACCOUNT_FORM' });
const userRequestEmailChange = (email: string): UserRequestEmailChangeAction => ({ type: 'USER_REQUEST_EMAIL_CHANGE', email });

export const submitConfirmPasswordForm = ({ password }: { password: string }, dispatch: Dispatch<*>): void => {
  dispatch({ type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password });
  dispatch(closeConfirmPasswordModal());
  setTimeout((): void => {
    dispatch(submit('account'));
  }, 1000);
};

export const submitAccountForm = (values: Object, dispatch: Dispatch<*>): Promise<*> => {
  dispatch(startSubmittingAccountForm());
  return Fetcher.put('/users/me', values)
    .then((): void => {
      dispatch(stopSubmittingAccountForm());
      dispatch(userRequestEmailChange(values.email));
    })
    .catch(({ response }): void => {
      dispatch(stopSubmittingAccountForm());
      console.log(response);
      if (response.message === 'Validation Failed') {
        // if (typeof response.errors.children.email === 'object') {
        //   throw new SubmissionError({ _error: response.errors.children.email.errors[0] });
        // }
      }
    });
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
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
