// @flow
import type { Dispatch } from 'redux';
import Fetcher from '../../services/Fetcher';

type State = {
  isSubmittingAccountForm: boolean,
  showConfirmPasswordModal: boolean
};
type StartSubmittingAccountFormAction = { type: 'SUBMIT_ACCOUNT_FORM' };
type ConfirmPasswordAction = { type: 'SHOW_CONFIRM_PASSWORD_MODAL' };

type Action =
    StartSubmittingAccountFormAction
  | ConfirmPasswordAction
;

const initialState = {
  isSubmittingAccountForm: false,
  showConfirmPasswordModal: false,
};

export const confirmPassword = (): ConfirmPasswordAction => ({ type: 'SHOW_CONFIRM_PASSWORD_MODAL' });
const startSubmittingAccountForm = (): StartSubmittingAccountFormAction => ({ type: 'SUBMIT_ACCOUNT_FORM' });

export const submitAccountForm = (values: Object, dispatch: Dispatch<*>): Promise<*> => {
  dispatch(startSubmittingAccountForm());
  return Fetcher.put('/users/me', values)
    .then(() => {
      // dispatch(voteSuccess(proposal.id, step.id, newVote, data.comment));
    })
    .catch(({ response }) => {
      // if (response.message === 'Validation Failed') {
      //   dispatch(stopVoting());
      //   if (typeof response.errors.children.email === 'object') {
      //     throw new SubmissionError({ _error: response.errors.children.email.errors[0] });
      //   }
      // }
    });
};

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'SUBMIT_ACCOUNT_FORM':
      return { ...state, isSubmittingAccountForm: true };
    case 'SHOW_CONFIRM_PASSWORD_MODAL':
      return { ...state, showConfirmPasswordModal: true };
    default:
      return state;
  }
};
