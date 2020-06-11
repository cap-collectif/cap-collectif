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

export type FeatureToggles = {
  blog: ?boolean,
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
  unstable__multilangue: ?boolean,
  display_pictures_in_event_list: ?boolean,
  unstable__analysis: ?boolean,
  report_browers_errors_to_sentry: ?boolean,
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
