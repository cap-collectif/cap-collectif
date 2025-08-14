import ToggleFeatureMutation from '~/mutations/ToggleFeatureMutation'
import type { Exact, Action, Dispatch, FeatureToggle, FeatureToggles, ReduxStoreSSOConfiguration } from '../../types'
type ShowNewFieldModalAction = {
  type: 'default/SHOW_NEW_FIELD_MODAL'
}
type HideNewFieldModalAction = {
  type: 'default/HIDE_NEW_FIELD_MODAL'
}
type ToggleFeatureSucceededAction = {
  type: 'default/TOGGLE_FEATURE_SUCCEEDED'
  feature: string
  enabled: boolean
}
type ShowUpdateFieldModalAction = {
  type: 'default/SHOW_UPDATE_FIELD_MODAL'
  id: number
}
type HideUpdateFieldModalAction = {
  type: 'default/HIDE_UPDATE_FIELD_MODAL'
}
export type DefaultAction =
  | ToggleFeatureSucceededAction
  | ShowNewFieldModalAction
  | ShowUpdateFieldModalAction
  | HideUpdateFieldModalAction
  | HideNewFieldModalAction
export type State = {
  readonly showNewFieldModal: boolean
  readonly themes: Array<Record<string, any>>
  readonly images:
    | {
        readonly avatar: string
        readonly logoUrl: string
      }
    | null
    | undefined
  readonly instanceName: string
  readonly features: Exact<FeatureToggles>
  readonly userTypes: Array<Record<string, any>>
  readonly parameters: Record<string, any>
  readonly updatingRegistrationFieldModal: number | null | undefined
  readonly ssoList: Array<ReduxStoreSSOConfiguration>
}
export const features: FeatureToggles = {
  report_browers_errors_to_sentry: false,
  login_saml: false,
  login_cas: false,
  oauth2_switch_user: false,
  votes_min: false,
  blog: false,
  calendar: false,
  login_facebook: false,
  privacy_policy: false,
  members_list: false,
  captcha: false,
  questionnaire_result: false,
  consent_external_communication: false,
  consent_internal_communication: false,
  newsletter: false,
  profiles: false,
  projects_form: false,
  project_trash: false,
  search: false,
  share_buttons: false,
  shield_mode: false,
  registration: false,
  phone_confirmation: false,
  reporting: false,
  themes: false,
  districts: false,
  user_type: false,
  votes_evolution: false,
  restrict_registration_via_email_domain: false,
  export: false,
  server_side_rendering: false,
  zipcode_at_register: false,
  consultation_plan: false,
  display_map: false,
  sso_by_pass_auth: false,
  allow_users_to_propose_events: false,
  secure_password: false,
  restrict_connection: false,
  login_franceconnect: false,
  read_more: false,
  display_pictures_in_depository_proposals_list: false,
  external_project: false,
  multilangue: false,
  display_pictures_in_event_list: false,
  emailing: false,
  emailing_parameters: false,
  proposal_revisions: false,
  import_proposals: false,
  analytics_page: false,
  http_redirects: false,
  project_admin: false,
  noindex_on_profiles: false,
  twilio: false,
  paper_vote: false,
  helpscout_beacon: false,
  organizations: false,
  moderation_comment: false,
  online_help: false,
  multi_consultations: false,
  full_proposal_card: false,
}
export const initialState: State = {
  themes: [],
  images: null,
  showNewFieldModal: false,
  instanceName: '',
  features,
  userTypes: [],
  parameters: {},
  updatingRegistrationFieldModal: null,
  ssoList: [],
}
export const toggleFeatureSucceeded = (feature: FeatureToggle, enabled: boolean): ToggleFeatureSucceededAction => ({
  type: 'default/TOGGLE_FEATURE_SUCCEEDED',
  feature,
  enabled,
})
export const toggleFeature = async (dispatch: Dispatch, feature: FeatureToggle, enabled: boolean): Promise<any> => {
  await ToggleFeatureMutation.commit({
    input: {
      type: feature,
      enabled,
    },
  })
  dispatch(toggleFeatureSucceeded(feature, enabled))
}
export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state }

    case 'default/SHOW_UPDATE_FIELD_MODAL':
      return { ...state, updatingRegistrationFieldModal: action.id }

    case 'default/HIDE_UPDATE_FIELD_MODAL':
      return { ...state, updatingRegistrationFieldModal: null }

    case 'default/SHOW_NEW_FIELD_MODAL':
      return { ...state, showNewFieldModal: true }

    case 'default/HIDE_NEW_FIELD_MODAL':
      return { ...state, showNewFieldModal: false }

    case 'default/TOGGLE_FEATURE_SUCCEEDED':
      return { ...state, features: { ...state.features, [action.feature]: action.enabled } }

    default:
      return state
  }
}
export const loginWithOpenID = (ssoList: Array<ReduxStoreSSOConfiguration>): boolean => {
  return ssoList.length > 0 && ssoList.filter(sso => sso.ssoType === 'oauth2').length > 0
}
