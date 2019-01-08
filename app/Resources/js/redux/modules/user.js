// @flow
import { submit, change, SubmissionError } from 'redux-form';
import Fetcher from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import type { Exact, Dispatch, Action } from '../../types';
import { formatSubmitResponses } from '../../utils/responsesHelper';

export type User = {
  +id: string,
  +username: string,
  +isEmailConfirmed: boolean,
  +isPhoneConfirmed: boolean,
  +phone: string,
  +isAdmin: boolean,
  +email: string,
  +newEmailToConfirm: ?string,
  +media: ?{
    +url: string,
  },
  +roles: Array<string>,
  +displayName: string,
  +uniqueId: string,
};

type Props = {
  shieldEnabled: boolean,
};

export type MapTokens = {
  +[provider: string]: {
    +styleId: string,
    +styleOwner: string,
    +publicToken: string,
    +initialPublicToken: string,
  },
};

export type State = {
  +showLoginModal: boolean,
  +displayChartModal: boolean,
  +showRegistrationModal: boolean,
  +isSubmittingAccountForm: boolean,
  +showConfirmPasswordModal: boolean,
  +confirmationEmailResent: boolean,
  +mapTokens: MapTokens,
  +registration_form: {
    +bottomTextDisplayed: boolean,
    +topTextDisplayed: boolean,
    +bottomText: string,
    +topText: string,
    +hasQuestions: boolean,
    +domains: Array<string>,
  },
  +user: ?{
    +id: string,
    +username: string,
    +isEmailConfirmed: boolean,
    +isPhoneConfirmed: boolean,
    +phone: string,
    +isAdmin: boolean,
    +email: string,
    +newEmailToConfirm: ?string,
    +media: ?{
      +url: string,
    },
    +roles: Array<string>,
    +displayName: string,
    +uniqueId: string,
  },
  +groupAdminUsersUserDeletionSuccessful: boolean,
  +groupAdminUsersUserDeletionFailed: boolean,
};

type AddRegistrationFieldAction = { type: 'ADD_REGISTRATION_FIELD_SUCCEEDED', element: Object };
type UpdateRegistrationFieldAction = {
  type: 'UPDATE_REGISTRATION_FIELD_SUCCEEDED',
  id: number,
  element: Object,
};
type CloseRegistrationModalAction = {| type: 'CLOSE_REGISTRATION_MODAL' |};
type ShowRegistrationModalAction = { type: 'SHOW_REGISTRATION_MODAL' };
type CloseLoginModalAction = { type: 'CLOSE_LOGIN_MODAL' };
type ShowLoginModalAction = { type: 'SHOW_LOGIN_MODAL' };
type DisplayChartModalAction = { type: 'DISPLAY_CHART_MODAL' };
type HideChartModalAction = {| type: 'HIDE_CHART_MODAL' |};
type UserRequestEmailChangeAction = { type: 'USER_REQUEST_EMAIL_CHANGE', email: string };
type StartSubmittingAccountFormAction = { type: 'SUBMIT_ACCOUNT_FORM' };
type StopSubmittingAccountFormAction = { type: 'STOP_SUBMIT_ACCOUNT_FORM' };
type CancelEmailChangeSucceedAction = { type: 'CANCEL_EMAIL_CHANGE' };
type ConfirmPasswordAction = { type: 'SHOW_CONFIRM_PASSWORD_MODAL' };
export type SubmitConfirmPasswordAction = {
  type: 'SUBMIT_CONFIRM_PASSWORD_FORM',
  password: string,
};
type CloseConfirmPasswordModalAction = { type: 'CLOSE_CONFIRM_PASSWORD_MODAL' };
type ReorderSucceededAction = { type: 'REORDER_REGISTRATION_QUESTIONS', questions: Array<Object> };
type GroupAdminUsersUserDeletionSuccessfulAction = {
  type: 'GROUP_ADMIN_USERS_USER_DELETION_SUCCESSFUL',
};
type GroupAdminUsersUserDeletionFailedAction = {
  type: 'GROUP_ADMIN_USERS_USER_DELETION_FAILED',
};
type GroupAdminUsersUserDeletionResetAction = {
  type: 'GROUP_ADMIN_USERS_USER_DELETION_RESET',
};

export type UserAction =
  | UpdateRegistrationFieldAction
  | ShowRegistrationModalAction
  | CloseRegistrationModalAction
  | ShowLoginModalAction
  | DisplayChartModalAction
  | HideChartModalAction
  | CloseLoginModalAction
  | StartSubmittingAccountFormAction
  | ConfirmPasswordAction
  | StopSubmittingAccountFormAction
  | CancelEmailChangeSucceedAction
  | CloseConfirmPasswordModalAction
  | UserRequestEmailChangeAction
  | ReorderSucceededAction
  | AddRegistrationFieldAction
  | SubmitConfirmPasswordAction
  | GroupAdminUsersUserDeletionSuccessfulAction
  | GroupAdminUsersUserDeletionFailedAction
  | GroupAdminUsersUserDeletionResetAction;

const initialState: State = {
  showLoginModal: false,
  displayChartModal: false,
  showRegistrationModal: false,
  isSubmittingAccountForm: false,
  confirmationEmailResent: false,
  showConfirmPasswordModal: false,
  user: null,
  mapTokens: {
    MAPBOX: {
      initialPublicToken:
        '***REMOVED***',
      publicToken:
        '***REMOVED***',
      styleOwner: 'capcollectif',
      styleId: '***REMOVED***',
    },
  },
  registration_form: {
    hasQuestions: false,
    bottomText: '',
    topText: '',
    bottomTextDisplayed: false,
    topTextDisplayed: false,
    questions: [],
    domains: [],
  },
  groupAdminUsersUserDeletionSuccessful: false,
  groupAdminUsersUserDeletionFailed: false,
};

export const addRegistrationFieldSucceeded = (element: Object): AddRegistrationFieldAction => ({
  type: 'ADD_REGISTRATION_FIELD_SUCCEEDED',
  element,
});
export const updateRegistrationFieldSucceeded = (
  id: number,
  element: Object,
): UpdateRegistrationFieldAction => ({ type: 'UPDATE_REGISTRATION_FIELD_SUCCEEDED', element, id });

export const showRegistrationModal = (): ShowRegistrationModalAction => ({
  type: 'SHOW_REGISTRATION_MODAL',
});
export const closeRegistrationModal = (): CloseRegistrationModalAction => ({
  type: 'CLOSE_REGISTRATION_MODAL',
});
export const closeLoginModal = (): CloseLoginModalAction => ({ type: 'CLOSE_LOGIN_MODAL' });
export const showLoginModal = (): ShowLoginModalAction => ({ type: 'SHOW_LOGIN_MODAL' });
export const displayChartModal = (): DisplayChartModalAction => ({ type: 'DISPLAY_CHART_MODAL' });
export const hideChartModal = (): HideChartModalAction => ({ type: 'HIDE_CHART_MODAL' });
export const confirmPassword = (): ConfirmPasswordAction => ({
  type: 'SHOW_CONFIRM_PASSWORD_MODAL',
});
export const closeConfirmPasswordModal = (): CloseConfirmPasswordModalAction => ({
  type: 'CLOSE_CONFIRM_PASSWORD_MODAL',
});
export const startSubmittingAccountForm = (): StartSubmittingAccountFormAction => ({
  type: 'SUBMIT_ACCOUNT_FORM',
});
export const stopSubmittingAccountForm = (): StopSubmittingAccountFormAction => ({
  type: 'STOP_SUBMIT_ACCOUNT_FORM',
});
export const userRequestEmailChange = (email: string): UserRequestEmailChangeAction => ({
  type: 'USER_REQUEST_EMAIL_CHANGE',
  email,
});
export const cancelEmailChangeSucceed = (): CancelEmailChangeSucceedAction => ({
  type: 'CANCEL_EMAIL_CHANGE',
});
export const submitConfirmPasswordFormSucceed = (
  password: string,
): SubmitConfirmPasswordAction => ({ type: 'SUBMIT_CONFIRM_PASSWORD_FORM', password });

export const setRegistrationEmailDomains = (values: {
  domains: Array<{ value: string }>,
}): Promise<*> => Fetcher.put('/registration_form', values);

export const login = (
  data: { username: string, password: string },
  dispatch: Dispatch,
): Promise<*> =>
  fetch(`${window.location.protocol}//${window.location.host}/login_check`, {
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
    .then((response: { success: boolean, reason: ?string }) => {
      if (response.success) {
        dispatch(closeLoginModal());
        window.location.reload();
        return true;
      }
      if (response.reason) {
        throw new SubmissionError({ _error: response.reason });
      } else {
        throw new SubmissionError({ _error: 'global.login_failed' });
      }
    });

export const register = (values: Object, dispatch: Dispatch, { shieldEnabled }: Props) => {
  const form = { ...values, questions: undefined, charte: undefined };
  if (values.questions && values.questions.length > 0) {
    form.responses = formatSubmitResponses(values.responses, values.questions);
  }
  return Fetcher.post('/users', form)
    .then(() => {
      if (shieldEnabled) {
        FluxDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'success',
            content: 'please-check-your-inbox',
            values: { emailAddress: values.email },
          },
        });
      } else {
        FluxDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: { bsStyle: 'success', content: 'alert.success.add.user' },
        });
        login({ username: values.email, password: values.plainPassword }, dispatch);
      }
      dispatch(closeRegistrationModal());
    })
    .catch(error => {
      const response = error.response;
      const errors: Object = { _error: 'Registration failed !' };
      if (typeof window.grecaptcha !== 'undefined') {
        window.grecaptcha.reset();
        dispatch(change('registration-form', 'captcha', null));
      }
      if (response.errors) {
        const children = response.errors.children;
        if (children.email.errors && children.email.errors.length > 0) {
          children.email.errors.map(string => {
            if (string === 'already_used_email') {
              errors.email = 'registration.constraints.email.already_used';
            } else if (string === 'check_email.domain') {
              errors.email = 'registration.constraints.email.not_authorized';
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

export const submitConfirmPasswordForm = (
  { password }: { password: string },
  dispatch: Dispatch,
): void => {
  dispatch(submitConfirmPasswordFormSucceed(password));
  dispatch(closeConfirmPasswordModal());
  setTimeout((): void => {
    dispatch(submit('account'));
  }, 1000);
};

export const cancelEmailChange = (dispatch: Dispatch, previousEmail: string): void => {
  Fetcher.post('/account/cancel_email_change').then(() => {
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
  Fetcher.post('/account/resend_confirmation_email')
    .then(sendEmail)
    .catch(sendEmail);
};

export const submitAccountForm = (values: Object, dispatch: Dispatch): Promise<*> => {
  dispatch(startSubmittingAccountForm());
  return Fetcher.put('/users/me', values)
    .then(
      (): void => {
        dispatch(stopSubmittingAccountForm());
        dispatch(userRequestEmailChange(values.email));
      },
    )
    .catch(
      ({
        response: { message, errors },
      }: {
        response: { message: string, errors: { children?: ?Object } },
      }): void => {
        dispatch(stopSubmittingAccountForm());
        if (message === 'You must specify your password to update your email.') {
          throw new SubmissionError({ _error: 'user.confirm.wrong_password' });
        }
        if (message === 'Already used email.') {
          throw new SubmissionError({ _error: 'registration.constraints.email.already_used' });
        }
        if (message === 'Unauthorized email domain.') {
          throw new SubmissionError({ _error: 'unauthorized-domain-name' });
        }
        if (message === 'Validation Failed.') {
          if (
            errors.children &&
            errors.children.newEmailToConfirm &&
            errors.children.newEmailToConfirm.errors &&
            Array.isArray(errors.children.newEmailToConfirm.errors) &&
            errors.children.newEmailToConfirm.errors[0]
          ) {
            throw new SubmissionError({
              // $FlowFixMe
              _error: `registration.constraints.${errors.children.newEmailToConfirm.errors[0]}`,
            });
          }
        }
        throw new SubmissionError({ _error: 'global.error' });
      },
    );
};

const reorderSuceeded = (questions: Array<Object>): ReorderSucceededAction => ({
  type: 'REORDER_REGISTRATION_QUESTIONS',
  questions,
});
export const reorderRegistrationQuestions = (questions: Array<Object>, dispatch: Dispatch) => {
  Fetcher.patch('/registration_form/questions', { questions });
  dispatch(reorderSuceeded(questions));
};

export const groupAdminUsersUserDeletionSuccessful = (): GroupAdminUsersUserDeletionSuccessfulAction => ({
  type: 'GROUP_ADMIN_USERS_USER_DELETION_SUCCESSFUL',
});
export const groupAdminUsersUserDeletionFailed = (): GroupAdminUsersUserDeletionFailedAction => ({
  type: 'GROUP_ADMIN_USERS_USER_DELETION_FAILED',
});
export const groupAdminUsersUserDeletionReset = (): GroupAdminUsersUserDeletionResetAction => ({
  type: 'GROUP_ADMIN_USERS_USER_DELETION_RESET',
});

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'DISPLAY_CHART_MODAL':
      return { ...state, displayChartModal: true };
    case 'HIDE_CHART_MODAL':
      return { ...state, displayChartModal: false };
    case 'SHOW_REGISTRATION_MODAL':
      return { ...state, showRegistrationModal: true };
    case 'CLOSE_REGISTRATION_MODAL':
      return { ...state, showRegistrationModal: false };
    case 'SHOW_LOGIN_MODAL':
      return { ...state, showLoginModal: true };
    case 'CLOSE_LOGIN_MODAL':
      return { ...state, showLoginModal: false };
    case 'CANCEL_EMAIL_CHANGE':
      return {
        ...state,
        user: { ...state.user, newEmailToConfirm: null },
        confirmationEmailResent: false,
      };
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
    case 'GROUP_ADMIN_USERS_USER_DELETION_SUCCESSFUL':
      return { ...state, groupAdminUsersUserDeletionSuccessful: true };
    case 'GROUP_ADMIN_USERS_USER_DELETION_FAILED':
      return { ...state, groupAdminUsersUserDeletionFailed: true };
    case 'GROUP_ADMIN_USERS_USER_DELETION_RESET':
      return {
        ...state,
        groupAdminUsersUserDeletionSuccessful: false,
        groupAdminUsersUserDeletionFailed: false,
      };
    default:
      return state;
  }
};
