import { change, SubmissionError } from 'redux-form'
import type { Exact, Dispatch, Action } from '~/types'
import CookieMonster from '../../CookieMonster'
import type { RegistrationForm_query } from '~relay/RegistrationForm_query.graphql'
import formatSubmitResponses from '~/utils/form/formatSubmitResponses'
import RegisterMutation from '~/mutations/RegisterMutation'
import type { RegisterMutationResponse } from '~relay/RegisterMutation.graphql'
import CancelEmailChangeMutation from '~/mutations/CancelEmailChangeMutation'
import ResendEmailConfirmationMutation from '~/mutations/ResendEmailConfirmationMutation'
import RegisterEmailDomainsMutation from '~/mutations/RegisterEmailDomainsMutation'
import type { RegisterEmailDomainsInput } from '~relay/RegisterEmailDomainsMutation.graphql'
import { userActions } from './user_actions'
import { IntlShape } from 'react-intl'
import { toast } from '~ds/Toast'
export const accountForm = 'accountForm'
const LOGIN_WRONG_CREDENTIALS = 'Bad credentials.'
const MISSING_CAPTCHA = 'You must provide a captcha to login.'
export type User = {
  readonly id: string
  readonly username: string
  readonly isEmailConfirmed: boolean
  readonly isPhoneConfirmed: boolean
  readonly isEvaluerOnLegacyTool: boolean
  readonly isEvaluerOnNewTool: boolean
  readonly phone: string
  readonly isAdmin: boolean
  readonly isSuperAdmin: boolean
  readonly isProjectAdmin: boolean
  readonly isOnlyProjectAdmin: boolean
  readonly isOrganizationMember: boolean
  readonly email: string
  readonly newEmailToConfirm: string | null | undefined
  readonly media:
    | {
        readonly url: string
      }
    | null
    | undefined
  readonly _links: {
    readonly profile: string
  }
  readonly roles: Array<string>
  readonly displayName: string
  readonly uniqueId: string
}
type Props = {
  shieldEnabled: boolean
  query: RegistrationForm_query
  intl: IntlShape
}
export type State = {
  readonly showLoginModal: boolean
  readonly showLocaleHeader: boolean
  readonly displayChartModal: boolean
  readonly showRegistrationModal: boolean
  readonly registration_form: {
    readonly bottomTextDisplayed: boolean
    readonly topTextDisplayed: boolean
    readonly bottomText: string
    readonly topText: string
    readonly domains: Array<string>
  }
  readonly user:
    | {
        readonly id: string
        readonly username: string
        readonly isEmailConfirmed: boolean
        readonly isPhoneConfirmed: boolean
        readonly phone: string
        readonly isAdmin: boolean
        readonly isSuperAdmin: boolean
        readonly isProjectAdmin: boolean
        readonly isOnlyProjectAdmin: boolean
        readonly isOrganizationMember: boolean
        readonly isAdminOrganization: boolean
        readonly organizationId: string | null
        readonly email: string
        readonly newEmailToConfirm: string | null | undefined
        readonly media:
          | {
              readonly url: string
            }
          | null
          | undefined
        readonly roles: Array<string>
        readonly displayName: string
        readonly uniqueId: string
      }
    | null
    | undefined
  readonly groupAdminUsersUserDeletionSuccessful: boolean
  readonly groupAdminUsersUserDeletionFailed: boolean
}
type AddRegistrationFieldAction = {
  type: 'ADD_REGISTRATION_FIELD_SUCCEEDED'
  element: Record<string, any>
}
type UpdateRegistrationFieldAction = {
  type: 'UPDATE_REGISTRATION_FIELD_SUCCEEDED'
  id: number
  element: Record<string, any>
}
type CloseRegistrationModalAction = {
  type: 'CLOSE_REGISTRATION_MODAL'
}
export type ShowRegistrationModalAction = {
  type: 'SHOW_REGISTRATION_MODAL'
}
type ChangeLocaleAction = {
  type: 'CHANGE_LOCALE_ACTION'
}
type CloseLoginModalAction = {
  type: 'CLOSE_LOGIN_MODAL'
}
export type ShowLoginModalAction = {
  type: 'SHOW_LOGIN_MODAL'
}
type DisplayChartModalAction = {
  type: 'DISPLAY_CHART_MODAL'
}
type HideChartModalAction = {
  type: 'HIDE_CHART_MODAL'
}
type UserRequestEmailChangeAction = {
  type: 'USER_REQUEST_EMAIL_CHANGE'
  email: string
}
type CancelEmailChangeSucceedAction = {
  type: 'CANCEL_EMAIL_CHANGE'
}
type GroupAdminUsersUserDeletionSuccessfulAction = {
  type: 'GROUP_ADMIN_USERS_USER_DELETION_SUCCESSFUL'
}
type GroupAdminUsersUserDeletionFailedAction = {
  type: 'GROUP_ADMIN_USERS_USER_DELETION_FAILED'
}
type GroupAdminUsersUserDeletionResetAction = {
  type: 'GROUP_ADMIN_USERS_USER_DELETION_RESET'
}
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
  | ChangeLocaleAction
  | GroupAdminUsersUserDeletionResetAction
const initialState: State = {
  showLoginModal: false,
  showLocaleHeader: true,
  displayChartModal: false,
  showRegistrationModal: false,
  user: null,
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
}
export const addRegistrationFieldSucceeded = (element: Record<string, any>): AddRegistrationFieldAction => ({
  type: 'ADD_REGISTRATION_FIELD_SUCCEEDED',
  element,
})
export const updateRegistrationFieldSucceeded = (
  id: number,
  element: Record<string, any>,
): UpdateRegistrationFieldAction => ({
  type: 'UPDATE_REGISTRATION_FIELD_SUCCEEDED',
  element,
  id,
})
export const changeLocaleAction = (): ChangeLocaleAction => ({
  type: 'CHANGE_LOCALE_ACTION',
})
export const showRegistrationModal = (): ShowRegistrationModalAction => ({
  type: 'SHOW_REGISTRATION_MODAL',
})
export const closeRegistrationModal = (): CloseRegistrationModalAction => ({
  type: 'CLOSE_REGISTRATION_MODAL',
})
export const closeLoginModal = (): CloseLoginModalAction => ({
  type: 'CLOSE_LOGIN_MODAL',
})
export const showLoginModal = (): ShowLoginModalAction => ({
  type: 'SHOW_LOGIN_MODAL',
})
export const displayChartModal = (): DisplayChartModalAction => ({
  type: 'DISPLAY_CHART_MODAL',
})
export const hideChartModal = (): HideChartModalAction => ({
  type: 'HIDE_CHART_MODAL',
})
export const userRequestEmailChange = (email: string): UserRequestEmailChangeAction => ({
  type: 'USER_REQUEST_EMAIL_CHANGE',
  email,
})
export const cancelEmailChangeSucceed = (): CancelEmailChangeSucceedAction => ({
  type: 'CANCEL_EMAIL_CHANGE',
})
export const setRegistrationEmailDomains = (values: RegisterEmailDomainsInput): Promise<any> => {
  return RegisterEmailDomainsMutation.commit({
    input: values,
  })
}
export const login = (
  data: {
    username: string
    password: string
    displayCaptcha: boolean
    captcha?: string | null | undefined
  },
  dispatch: Dispatch,
  props: {
    restrictConnection: boolean
    values?: {
      onSuccessAction?: string
    }
  },
): Promise<any> => {
  if (!data.password || data.password.length < 1) {
    return new Promise(() => {
      throw new SubmissionError({
        _error: 'your-email-address-or-password-is-incorrect',
      })
    })
  }

  if (data.displayCaptcha && props && props.restrictConnection && !data.captcha) {
    return new Promise(() => {
      throw new SubmissionError({
        captcha: 'registration.constraints.captcha.invalid',
        showCaptcha: true,
      })
    })
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
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      }

      return response.json()
    })
    .then((response: { success?: boolean; reason: string | null | undefined; failedAttempts?: number }) => {
      if (response.success) {
        if (props.values?.onSuccessAction) {
          userActions(props.values.onSuccessAction)
        } else {
          dispatch(closeLoginModal())
          window.location.reload()
        }

        return true
      }

      if (response.reason === LOGIN_WRONG_CREDENTIALS) {
        if (response.failedAttempts !== undefined && response.failedAttempts >= 5) {
          throw new SubmissionError({
            _error: 'your-email-address-or-password-is-incorrect',
            showCaptcha: true,
          })
        }

        throw new SubmissionError({
          _error: 'your-email-address-or-password-is-incorrect',
        })
      } else if (response.reason === MISSING_CAPTCHA) {
        throw new SubmissionError({
          _error: response.reason,
          showCaptcha: true,
        })
      } else if (response.reason) {
        throw new SubmissionError({
          _error: response.reason,
        })
      } else {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      }
    })
}
export const register = async (
  values: Record<string, any>,
  dispatch: Dispatch,
  { shieldEnabled, query, intl }: Props,
) => {
  const form = {
    ...values,
    questions: undefined,
    charte: undefined,
    passwordConditions: undefined,
    passwordComplexityScore: undefined,
  }

  if (values.questions && values.questions.length > 0) {
    form.responses = formatSubmitResponses(values.responses, values.questions)
  }

  const response: RegisterMutationResponse = await RegisterMutation.commit({
    input: form,
  })
  const errorsCode = response.register?.errorsCode

  if (errorsCode) {
    let errors = {}
    errorsCode.forEach(errorCode => {
      if (errorCode === 'CAPTCHA_INVALID') {
        errors = { ...errors, captcha: 'registration.constraints.captcha.invalid' }
      }

      if (errorCode === 'EMAIL_ALREADY_USED') {
        errors = { ...errors, email: 'registration.constraints.email.already_used' }
      }

      if (errorCode === 'EMAIL_DOMAIN_NOT_AUTHORIZED') {
        errors = { ...errors, email: 'registration.constraints.email.not_authorized' }
      }

      if (errorCode === 'RATE_LIMIT_REACHED') {
        errors = { ...errors, email: 'registration.constraints.rate.limit.reached' }
      }
    })
    throw new SubmissionError(errors)
  }

  if (shieldEnabled && !form.invitationToken) {
    toast({
      content: intl.formatMessage(
        { id: 'please-check-your-inbox' },
        {
          emailAddress: values.email,
        },
      ),
      variant: 'success',
    })
  } else {
    toast({ content: intl.formatMessage({ id: 'alert.success.add.user' }), variant: 'success' })

    const adCookie = !(
      typeof CookieMonster.adCookieConsentValue() === 'undefined' || CookieMonster.adCookieConsentValue() === false
    )

    if (adCookie) {
      // @ts-expect-error call to window function not currently well typed
      window.App.dangerouslyExecuteHtml(query.registrationScript)
    }

    await login(
      {
        username: values.email,
        password: values.plainPassword,
        displayCaptcha: false,
      },
      dispatch,
      {
        restrictConnection: false,
      },
    )
  }

  dispatch(closeRegistrationModal())
}
export const cancelEmailChange = async (dispatch: Dispatch, previousEmail: string): Promise<any> => {
  await CancelEmailChangeMutation.commit()
  dispatch(cancelEmailChangeSucceed())
  dispatch(change(accountForm, 'email', previousEmail))
}

const sendEmail = (intl: IntlShape) => {
  toast({ content: intl.formatMessage({ id: 'user.confirm.sent' }), variant: 'success' })
}

export const resendConfirmation = async (intl: IntlShape): Promise<any> => {
  const { resendEmailConfirmation } = await ResendEmailConfirmationMutation.commit()

  if (!resendEmailConfirmation?.errorCode) {
    sendEmail(intl)
  }
}
export const groupAdminUsersUserDeletionSuccessful = (): GroupAdminUsersUserDeletionSuccessfulAction => ({
  type: 'GROUP_ADMIN_USERS_USER_DELETION_SUCCESSFUL',
})
export const groupAdminUsersUserDeletionFailed = (): GroupAdminUsersUserDeletionFailedAction => ({
  type: 'GROUP_ADMIN_USERS_USER_DELETION_FAILED',
})
export const groupAdminUsersUserDeletionReset = (): GroupAdminUsersUserDeletionResetAction => ({
  type: 'GROUP_ADMIN_USERS_USER_DELETION_RESET',
})
export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state }

    case 'CHANGE_LOCALE_ACTION':
      return { ...state, showLocaleHeader: false }

    case 'DISPLAY_CHART_MODAL':
      return { ...state, displayChartModal: true }

    case 'HIDE_CHART_MODAL':
      return { ...state, displayChartModal: false }

    case 'SHOW_REGISTRATION_MODAL':
      return { ...state, showRegistrationModal: true }

    case 'CLOSE_REGISTRATION_MODAL':
      return { ...state, showRegistrationModal: false }

    case 'SHOW_LOGIN_MODAL':
      return { ...state, showLoginModal: true }

    case 'CLOSE_LOGIN_MODAL':
      return { ...state, showLoginModal: false }

    case 'CANCEL_EMAIL_CHANGE':
      return {
        ...state,
        user: { ...state.user, newEmailToConfirm: null },
      }

    case 'USER_REQUEST_EMAIL_CHANGE':
      return { ...state, user: { ...state.user, newEmailToConfirm: action.email } }

    case 'GROUP_ADMIN_USERS_USER_DELETION_SUCCESSFUL':
      return { ...state, groupAdminUsersUserDeletionSuccessful: true }

    case 'GROUP_ADMIN_USERS_USER_DELETION_FAILED':
      return { ...state, groupAdminUsersUserDeletionFailed: true }

    case 'GROUP_ADMIN_USERS_USER_DELETION_RESET':
      return { ...state, groupAdminUsersUserDeletionSuccessful: false, groupAdminUsersUserDeletionFailed: false }

    default:
      return state
  }
}
