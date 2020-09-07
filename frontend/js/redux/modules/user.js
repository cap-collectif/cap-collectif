// @flow
import { change, SubmissionError } from 'redux-form';
import Fetcher from '../../services/Fetcher';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../constants/AlertConstants';
import type { Exact, Dispatch, Action } from '../../types';
import config from '../../config';
import CookieMonster from '../../CookieMonster';
import type { RegistrationForm_query } from '~relay/RegistrationForm_query.graphql';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import { formName as accountForm } from '~/components/User/Profile/AccountForm';

const LOGIN_WRONG_CREDENTIALS = 'Bad credentials.';

export type User = {
  +id: string,
  +username: string,
  +isEmailConfirmed: boolean,
  +isPhoneConfirmed: boolean,
  +isEvaluerOnLegacyTool: boolean,
  +isEvaluerOnNewTool: boolean,
  +phone: string,
  +isAdmin: boolean,
  +email: string,
  +newEmailToConfirm: ?string,
  +media: ?{
    +url: string,
  },
  +_links: {
    +profile: string,
  },
  +roles: Array<string>,
  +displayName: string,
  +uniqueId: string,
};

type Props = {
  shieldEnabled: boolean,
  query: RegistrationForm_query,
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
  +showLocaleHeader: boolean,
  +displayChartModal: boolean,
  +showRegistrationModal: boolean,
  +mapTokens: MapTokens,
  +registration_form: {
    +bottomTextDisplayed: boolean,
    +topTextDisplayed: boolean,
    +bottomText: string,
    +topText: string,
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
export type ShowRegistrationModalAction = { type: 'SHOW_REGISTRATION_MODAL' };
type ChangeLocaleAction = { type: 'CHANGE_LOCALE_ACTION' };
type CloseLoginModalAction = { type: 'CLOSE_LOGIN_MODAL' };
export type ShowLoginModalAction = { type: 'SHOW_LOGIN_MODAL' };
type DisplayChartModalAction = { type: 'DISPLAY_CHART_MODAL' };
type HideChartModalAction = {| type: 'HIDE_CHART_MODAL' |};
type UserRequestEmailChangeAction = { type: 'USER_REQUEST_EMAIL_CHANGE', email: string };
type CancelEmailChangeSucceedAction = { type: 'CANCEL_EMAIL_CHANGE' };
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
  | CancelEmailChangeSucceedAction
  | UserRequestEmailChangeAction
  | AddRegistrationFieldAction
  | GroupAdminUsersUserDeletionSuccessfulAction
  | GroupAdminUsersUserDeletionFailedAction
  | GroupAdminUsersUserDeletionResetAction;

const initialState: State = {
  showLoginModal: false,
  showLocaleHeader: true,
  displayChartModal: false,
  showRegistrationModal: false,
  user: null,
  mapTokens: {
    MAPBOX: {
      initialPublicToken: config.mapProviders.MAPBOX.apiKey,
      publicToken: config.mapProviders.MAPBOX.apiKey,
      styleOwner: config.mapProviders.MAPBOX.styleOwner,
      styleId: config.mapProviders.MAPBOX.styleId,
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

export const changeLocaleAction = (): ChangeLocaleAction => ({
  type: 'CHANGE_LOCALE_ACTION',
});

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
export const userRequestEmailChange = (email: string): UserRequestEmailChangeAction => ({
  type: 'USER_REQUEST_EMAIL_CHANGE',
  email,
});
export const cancelEmailChangeSucceed = (): CancelEmailChangeSucceedAction => ({
  type: 'CANCEL_EMAIL_CHANGE',
});

export const setRegistrationEmailDomains = (values: {
  domains: Array<{ value: string }>,
}): Promise<*> => Fetcher.put('/registration_form', values);

export const login = (
  data: { username: string, password: string, displayCaptcha: boolean, captcha?: ?string },
  dispatch: Dispatch,
  props: { restrictConnection: boolean },
): Promise<*> => {
  if (!data.password || data.password.length < 1) {
    return new Promise(() => {
      throw new SubmissionError({
        _error: 'your-email-address-or-password-is-incorrect',
      });
    });
  }
  if (data.displayCaptcha && props && props.restrictConnection && !data.captcha) {
    return new Promise(() => {
      throw new SubmissionError({
        captcha: 'registration.constraints.captcha.invalid',
        showCaptcha: true,
      });
    });
  }
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
    .then(response => {
      if (response.status >= 500) {
        throw new SubmissionError({ _error: 'global.error.server.form' });
      }
      return response.json();
    })
    .then((response: { success?: boolean, reason: ?string, failedAttempts?: number }) => {
      if (response.success) {
        dispatch(closeLoginModal());
        window.location.reload();
        return true;
      }
      if (response.reason === LOGIN_WRONG_CREDENTIALS) {
        if (response.failedAttempts !== undefined && response.failedAttempts >= 5) {
          throw new SubmissionError({
            _error: 'your-email-address-or-password-is-incorrect',
            showCaptcha: true,
          });
        }
        throw new SubmissionError({ _error: 'your-email-address-or-password-is-incorrect' });
      } else if (response.reason) {
        throw new SubmissionError({ _error: response.reason });
      } else {
        throw new SubmissionError({ _error: 'global.error.server.form' });
      }
    });
};

export const register = (values: Object, dispatch: Dispatch, { shieldEnabled, query }: Props) => {
  const form = {
    ...values,
    questions: undefined,
    charte: undefined,
    passwordConditions: undefined,
    passwordComplexityScore: undefined,
  };
  if (values.questions && values.questions.length > 0) {
    form.responses = formatSubmitResponses(values.responses, values.questions);
  }
  return Fetcher.post('/users', form)
    .then(() => {
      if (shieldEnabled && !form.invitationToken) {
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

        const adCookie = !(
          typeof CookieMonster.adCookieConsentValue() === 'undefined' ||
          CookieMonster.adCookieConsentValue() === false
        );

        if (adCookie) {
          // $FlowFixMe call to window function not currently well typed
          window.App.dangerouslyExecuteHtml(query.registrationScript);
        }

        login(
          { username: values.email, password: values.plainPassword, displayCaptcha: false },
          dispatch,
          { restrictConnection: false },
        );
      }
      dispatch(closeRegistrationModal());
    })
    .catch(error => {
      const { response } = error;
      const errors: Object = { _error: 'Registration failed !' };
      if (typeof window.grecaptcha !== 'undefined') {
        window.grecaptcha.reset();
        dispatch(change('registration-form', 'captcha', null));
      }
      if (response.errors) {
        const { children } = response.errors;
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

export const cancelEmailChange = (dispatch: Dispatch, previousEmail: string): void => {
  Fetcher.post('/account/cancel_email_change').then(() => {
    dispatch(cancelEmailChangeSucceed());
    dispatch(change(accountForm, 'email', previousEmail));
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
    case 'CHANGE_LOCALE_ACTION':
      return { ...state, showLocaleHeader: false };
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
        // $FlowFixMe Redux is untyped
        user: { ...state.user, newEmailToConfirm: null },
      };
    case 'USER_REQUEST_EMAIL_CHANGE':
      // $FlowFixMe Redux is untyped
      return { ...state, user: { ...state.user, newEmailToConfirm: action.email } };
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
