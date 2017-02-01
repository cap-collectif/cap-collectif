// @flow
import type { Dispatch } from 'redux';
import { submit } from 'redux-form';
import Fetcher from '../../services/Fetcher';

type State = {
  isSubmittingAccountForm: boolean,
  showConfirmPasswordModal: boolean
};
type StartSubmittingAccountFormAction = { type: 'SUBMIT_ACCOUNT_FORM' };
type StopSubmittingAccountFormAction = { type: 'STOP_SUBMIT_ACCOUNT_FORM' };
type ConfirmPasswordAction = { type: 'SHOW_CONFIRM_PASSWORD_MODAL' };
export type SubmitConfirmPasswordAction = { type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password: string };
type CloseConfirmPasswordModalAction = { type: 'CLOSE_CONFIRM_PASSWORD_MODAL' };
type Action =
    StartSubmittingAccountFormAction
  | ConfirmPasswordAction
  | CloseConfirmPasswordModalAction
;

const initialState = {
  isSubmittingAccountForm: false,
  showConfirmPasswordModal: false,
};

export const confirmPassword = (): ConfirmPasswordAction => ({ type: 'SHOW_CONFIRM_PASSWORD_MODAL' });
export const closeConfirmPasswordModal = (): CloseConfirmPasswordModalAction => ({ type: 'CLOSE_CONFIRM_PASSWORD_MODAL' });
const startSubmittingAccountForm = (): StartSubmittingAccountFormAction => ({ type: 'SUBMIT_ACCOUNT_FORM' });
const stopSubmittingAccountForm = (): StopSubmittingAccountFormAction => ({ type: 'STOP_SUBMIT_ACCOUNT_FORM' });

export const submitConfirmPasswordForm = (values: Object, dispatch: Dispatch<*>) => {
  dispatch({ type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password: values.password });
  dispatch(closeConfirmPasswordModal());
  setTimeout(() => {
    dispatch(submit('account'));
  }, 1000);
};

export const submitAccountForm = (values: Object, dispatch: Dispatch<*>): Promise<*> => {
  dispatch(startSubmittingAccountForm());
  return Fetcher.put('/users/me', values)
    .then(() => {
      dispatch(stopSubmittingAccountForm());
      return true;
    })
    .catch(({ response }) => {
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
    case 'SUBMIT_ACCOUNT_FORM':
      return { ...state, isSubmittingAccountForm: true };
    case 'STOP_SUBMIT_ACCOUNT_FORM':
      return { ...state, isSubmittingAccountForm: false };
    case 'SHOW_CONFIRM_PASSWORD_MODAL':
      return { ...state, showConfirmPasswordModal: true };
    case 'CLOSE_CONFIRM_PASSWORD_MODAL':
      return { ...state, showConfirmPasswordModal: false };
    default:
      return state;
  }
};
