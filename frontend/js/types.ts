import { $Keys } from 'utility-types'
import { ReactNode } from 'react'

import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux'
import 'redux'
import type { Actions as ReduxFormAction } from 'redux-form'
import type { State as ProposalState, ProposalAction } from './redux/modules/proposal'
import type { State as OpinionState, OpinionAction } from './redux/modules/opinion'
import type { State as UserState, UserAction } from './redux/modules/user'
import type { State as ProjectState, ProjectAction } from './redux/modules/project'
import type { State as ReportState, ReportAction } from './redux/modules/report'
import type { State as DefaultState, DefaultAction } from './redux/modules/default'
import type { State as EventState, EventAction } from './redux/modules/event'
import type { State as LanguageState, LanguageAction } from './redux/modules/language'

export type Exact<T> = T
export type RelayGlobalId = string
export type Uuid = string
export type Uri = string
export type Opinion = {
  id: Uuid
}
export type Version = {
  id: Uuid
  parent: Record<string, any>
}
// small subset copy of 'relay-runtime/handlers/connection/ConnectionHandler'
// because ESLint could not resolve the internal type
export type ConnectionMetadata = {
  cursor: string | null | undefined
  count: string | null | undefined
}
export type ArgumentType = 'FOR' | 'AGAINST' | 'SIMPLE'
export type StepPropositionNavigationType =
  | 'ConsultationStep'
  | 'CollectStep'
  | 'PresentationStep'
  | 'OtherStep'
  | 'RankingStep'
  | 'SelectionStep'
  | 'QuestionnaireStep'
export type MediaFromAPI = {
  id: Uuid
  name: string
  url: Uri
}
// TODO We can (now) extract this enum from our GraphQL schema
export type FeatureToggles = {
  blog: boolean | null | undefined
  questionnaire_result: boolean | null | undefined
  calendar: boolean | null | undefined
  captcha: boolean | null | undefined
  consent_external_communication: boolean | null | undefined
  consent_internal_communication: boolean | null | undefined
  login_facebook: boolean | null | undefined
  login_saml: boolean | null | undefined
  login_cas: boolean | null | undefined
  privacy_policy: boolean | null | undefined
  votes_min: boolean | null | undefined
  oauth2_switch_user: boolean | null | undefined
  members_list: boolean | null | undefined
  newsletter: boolean | null | undefined
  profiles: boolean | null | undefined
  projects_form: boolean | null | undefined
  project_trash: boolean | null | undefined
  search: boolean | null | undefined
  share_buttons: boolean | null | undefined
  shield_mode: boolean | null | undefined
  registration: boolean | null | undefined
  phone_confirmation: boolean | null | undefined
  restrict_registration_via_email_domain: boolean | null | undefined
  reporting: boolean | null | undefined
  themes: boolean | null | undefined
  districts: boolean | null | undefined
  user_type: boolean | null | undefined
  votes_evolution: boolean | null | undefined
  export: boolean | null | undefined
  server_side_rendering: boolean | null | undefined
  zipcode_at_register: boolean | null | undefined
  consultation_plan: boolean | null | undefined
  display_map: boolean | null | undefined
  sso_by_pass_auth: boolean | null | undefined
  allow_users_to_propose_events: boolean | null | undefined
  login_franceconnect: boolean | null | undefined
  secure_password: boolean | null | undefined
  restrict_connection: boolean | null | undefined
  read_more: boolean | null | undefined
  display_pictures_in_depository_proposals_list: boolean | null | undefined
  external_project: boolean | null | undefined
  multilangue: boolean | null | undefined
  display_pictures_in_event_list: boolean | null | undefined
  report_browers_errors_to_sentry: boolean | null | undefined
  emailing: boolean | null | undefined
  emailing_parameters: boolean | null | undefined
  proposal_revisions: boolean | null | undefined
  import_proposals: boolean | null | undefined
  analytics_page: boolean | null | undefined
  project_admin: boolean | null | undefined
  http_redirects: boolean | null | undefined
  noindex_on_profiles: boolean | null | undefined
  twilio: boolean | null | undefined
  paper_vote: boolean | null | undefined
  helpscout_beacon: boolean | null | undefined
  organizations: boolean | null | undefined
  moderation_comment: boolean | null | undefined
  online_help: boolean | null | undefined
  full_proposal_card: boolean | null | undefined
}
export type FeatureToggle = $Keys<FeatureToggles>
export type Action =
  | ProposalAction
  | OpinionAction
  | UserAction
  | ProjectAction
  | ReportAction
  | DefaultAction
  | EventAction
  | ReduxFormAction
  | LanguageAction
  | {
      type: '@@INIT'
    }
export type GlobalState = {
  form: Record<string, any>
  intl: Record<string, any>
  default: DefaultState
  proposal: ProposalState
  project: ProjectState
  report: ReportState
  user: UserState
  opinion: OpinionState
  event: EventState
  language: LanguageState
}
export type State = GlobalState
export type User = UserState
export type Store = ReduxStore<State, Action>
export type Dispatch = ReduxDispatch<Action>
export type BorderStyle = {
  enabled: boolean
  color: string
  opacity: number
  size: number
}
export type BackgroundStyle = {
  enabled: boolean
  color: string
  opacity: number
}
export type District = {
  id: string
  name: string
  geojson: string | null | undefined
  displayedOnMap: boolean
  border: BorderStyle | null | undefined
  background: BackgroundStyle | null | undefined
}
// @TODO: Add more type in the future here.
export type SSOType = 'oauth2' | 'franceconnect' | 'facebook' | 'cas'
export type ReduxStoreSSOConfiguration = {
  name: string
  ssoType: SSOType
}
export interface SSOConfigurationInterface {
  __typename: string
  id: string
  enabled: boolean
}
export type ResultPreloadQuery = {
  dispose: () => void
  getValue: (arg0: any) => void
  next: (arg0: any, arg1: any, arg2: any, arg3: any) => void
  subscribe: (arg0: any) => void
}
export type Query = {
  props: any
  error: string | null | undefined
  retry: () => void
  cached: any
}
// Inspired from the relay pagination props, but working with the relay-hooks implementation
export type RelayHookPaginationProps = {
  hasMore: () => boolean
  isLoading: () => boolean
  loadMore: (
    connectionConfig: Record<string, any>,
    pageSize: number,
    observerOrCallback: ((...args: Array<any>) => any) | null | undefined,
    options?: {
      force?: boolean
      fetchPolicy?: 'store-or-network' | 'network-only'
      metadata?: Record<string, unknown>
    },
  ) =>
    | {
        dispose(): void
      }
    | null
    | undefined
  refetchConnection: (
    connectionConfig: Record<string, any>,
    totalCount: number,
    observerOrCallback: ((...args: Array<any>) => any) | null | undefined,
    refetchVariables: Readonly<Record<string, any>> | null | undefined,
  ) =>
    | {
        dispose(): void
      }
    | null
    | undefined
}
// ref => https://react-slick.neostack.com/docs/api#adaptiveHeight
export type SettingsSlider = {
  accessibility?: boolean
  adaptativeHeight?: boolean
  afterChange?: (index: string) => void
  appendDots?: (dots: any) => ReactNode
  arrows?: boolean
  autoPlaySpeed?: boolean
  autoPlay?: boolean
  beforeChange?: (oldIndex: string, newIndex: string) => void
  centerMode?: boolean
  centerPadding?: string
  className?: string
  customPaging?: (index: string) => ReactNode
  dotsClass?: string
  dots?: boolean
  draggable?: boolean
  easing?: string
  fade?: boolean
  focusOnSelect?: boolean
  infinite?: boolean
  initialSlide?: number
  lazyLoad?: 'ondemand' | 'progressive'
  onEdge?: (direction: any) => void
  onInit?: () => void
  onLazyLoad?: (slidesLoaded: any) => void
  onReInit?: () => void
  onSwipe?: () => void
  pauseOnDotsHover?: boolean
  pauseOnFocus?: boolean
  pauseOnHover?: boolean
  responsive?: Array<any>
  rows?: number
  rtl?: boolean
  slide?: string
  slidesPerRow?: number
  slidesToScroll?: number
  speed?: number
  swipeToSlide?: number
  swipe?: boolean
  touchMove?: boolean
  touchThreshold?: number
  useCss?: boolean
  useTransform?: boolean
  variableWidth?: boolean
  vertical?: boolean
  edgeFriction?: number
}
