// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
// $FlowFixMe TODO we need to refacto all of redux-form typing
import type { Actions as ReduxFormAction } from 'redux-form';
import type { State as ProposalState, ProposalAction } from './redux/modules/proposal';
import type { State as OpinionState, OpinionAction } from './redux/modules/opinion';
import type { State as UserState, UserAction } from './redux/modules/user';
import type { State as ProjectState, ProjectAction } from './redux/modules/project';
import type { State as ReportState, ReportAction } from './redux/modules/report';
import type { State as DefaultState, DefaultAction } from './redux/modules/default';
import type { State as EventState, EventAction } from './redux/modules/event';
import type { State as LanguageState, LanguageAction } from './redux/modules/language';

export type Exact<T> = T;
export type RelayGlobalId = string;
export type Uuid = string;
export type Uri = string;
export type Opinion = { id: Uuid };
export type Version = { id: Uuid, parent: Object };

// small subset copy of 'relay-runtime/handlers/connection/ConnectionHandler'
// because ESLint could not resolve the internal type
export type ConnectionMetadata = {|
  cursor: ?string,
  count: ?string,
|};

export type ArgumentType = 'FOR' | 'AGAINST' | 'SIMPLE';
export type StepPropositionNavigationType =
  | 'ConsultationStep'
  | 'CollectStep'
  | 'PresentationStep'
  | 'OtherStep'
  | 'RankingStep'
  | 'SelectionStep'
  | 'QuestionnaireStep';

export type MediaFromAPI = {|
  +id: Uuid,
  +name: string,
  +url: Uri,
|};

// TODO We can (now) extract this enum from our GraphQL schema
export type FeatureToggles = {
  blog: ?boolean,
  unstable__remote_events: ?boolean,
  new_feature_questionnaire_result: ?boolean,
  unstable__admin_editor: ?boolean,
  calendar: ?boolean,
  captcha: ?boolean,
  consent_external_communication: ?boolean,
  consent_internal_communication: ?boolean,
  login_facebook: ?boolean,
  login_gplus: ?boolean,
  login_saml: ?boolean,
  login_paris: ?boolean,
  privacy_policy: ?boolean,
  votes_min: ?boolean,
  disconnect_openid: ?boolean,
  members_list: ?boolean,
  newsletter: ?boolean,
  profiles: ?boolean,
  projects_form: ?boolean,
  project_trash: ?boolean,
  search: ?boolean,
  share_buttons: ?boolean,
  shield_mode: ?boolean,
  registration: ?boolean,
  phone_confirmation: ?boolean,
  restrict_registration_via_email_domain: ?boolean,
  reporting: ?boolean,
  themes: ?boolean,
  districts: ?boolean,
  user_type: ?boolean,
  votes_evolution: ?boolean,
  export: ?boolean,
  server_side_rendering: ?boolean,
  zipcode_at_register: ?boolean,
  consultation_plan: ?boolean,
  display_map: ?boolean,
  sso_by_pass_auth: ?boolean,
  allow_users_to_propose_events: ?boolean,
  login_franceconnect: ?boolean,
  secure_password: ?boolean,
  restrict_connection: ?boolean,
  read_more: ?boolean,
  display_pictures_in_depository_proposals_list: ?boolean,
  external_project: ?boolean,
  app_news: ?boolean,
  multilangue: ?boolean,
  display_pictures_in_event_list: ?boolean,
  unstable__analysis: ?boolean,
  report_browers_errors_to_sentry: ?boolean,
  user_invitations: ?boolean,
};

export type FeatureToggle = $Keys<FeatureToggles>;

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
  | { type: '@@INIT' };

export type GlobalState = {|
  +form: Object,
  +intl: Object,
  +default: DefaultState,
  +proposal: ProposalState,
  +project: ProjectState,
  +report: ReportState,
  +user: UserState,
  +opinion: OpinionState,
  +event: EventState,
  +language: LanguageState,
|};

export type State = GlobalState;
export type User = UserState;

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;

export type BorderStyle = {|
  enabled: boolean,
  color: string,
  opacity: number,
  size: number,
|};

export type BackgroundStyle = {|
  enabled: boolean,
  color: string,
  opacity: number,
|};

export type District = {|
  id: string,
  name: string,
  geojson: ?string,
  displayedOnMap: boolean,
  border: ?BorderStyle,
  background: ?BackgroundStyle,
|};

// @TODO: Add more type in the future here.
export type SSOType = 'oauth2' | 'franceconnect';

export type ReduxStoreSSOConfiguration = {|
  name: string,
  ssoType: SSOType,
  labelColor: string,
  buttonColor: string,
|};

export interface SSOConfigurationInterface {
  +__typename: string;
  +id: string;
  +enabled: boolean;
}

export type ResultPreloadQuery = {|
  dispose: () => void,
  getValue: any => void,
  next: (any, any, any, any) => void,
  subscribe: any => void,
|};

export type Query = {|
  props: any,
  error: ?string,
  retry: () => void,
  cached: any,
|};

// ref => https://react-slick.neostack.com/docs/api#adaptiveHeight
export type SettingsSlider = {|
  accessibility?: boolean,
  adaptativeHeight?: boolean,
  afterChange?: (index: string) => void,
  appendDots?: (dots: any) => React.Node,
  arrows?: boolean,
  autoPlaySpeed?: boolean,
  autoPlay?: boolean,
  beforeChange?: (oldIndex: string, newIndex: string) => void,
  centerMode?: boolean,
  centerPadding?: string,
  className?: string,
  customPaging?: (index: string) => React.Node,
  dotsClass?: string,
  dots?: boolean,
  draggable?: boolean,
  easing?: string,
  fade?: boolean,
  focusOnSelect?: boolean,
  infinite?: boolean,
  initialSlide?: number,
  lazyLoad?: 'ondemand' | 'progressive',
  onEdge?: (direction: any) => void,
  onInit?: () => void,
  onLazyLoad?: (slidesLoaded: any) => void,
  onReInit?: () => void,
  onSwipe?: () => void,
  pauseOnDotsHover?: boolean,
  pauseOnFocus?: boolean,
  pauseOnHover?: boolean,
  responsive?: Array<any>,
  rows?: number,
  rtl?: boolean,
  slide?: string,
  slidesPerRow?: number,
  slidesToScroll?: number,
  speed?: number,
  swipeToSlide?: number,
  swipe?: boolean,
  touchMove?: boolean,
  touchThreshold?: number,
  useCss?: boolean,
  useTransform?: boolean,
  variableWidth?: boolean,
  vertical?: boolean,
|};
