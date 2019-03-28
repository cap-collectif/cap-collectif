// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import type { Actions as ReduxFormAction } from 'redux-form';
import type { State as ProposalState, ProposalAction } from './redux/modules/proposal';
import type { State as OpinionState, OpinionAction } from './redux/modules/opinion';
import type { State as UserState, UserAction } from './redux/modules/user';
import type { State as ProjectState, ProjectAction } from './redux/modules/project';
import type { State as ReportState, ReportAction } from './redux/modules/report';
import type { State as DefaultState, DefaultAction } from './redux/modules/default';
import type { State as EventState, EventAction } from './redux/modules/event';

export type Exact<T> = T;
export type Uuid = string;
export type Uri = string;
export type Opinion = { id: Uuid };
export type Version = { id: Uuid, parent: Object };

export type MediaFromAPI = {|
  +id: Uuid,
  +name: string,
  +url: Uri,
|};

export type FeatureToggles = {
  blog: boolean,
  new_feature_questionnaire_result: boolean,
  calendar: boolean,
  captcha: boolean,
  consent_external_communication: boolean,
  consent_internal_communication: boolean,
  login_facebook: boolean,
  login_gplus: boolean,
  login_saml: boolean,
  login_paris: boolean,
  privacy_policy: boolean,
  login_openid: boolean,
  disconnect_openid: boolean,
  members_list: boolean,
  newsletter: boolean,
  profiles: boolean,
  projects_form: boolean,
  project_trash: boolean,
  search: boolean,
  share_buttons: boolean,
  shield_mode: boolean,
  registration: boolean,
  phone_confirmation: boolean,
  restrict_registration_via_email_domain: boolean,
  reporting: boolean,
  themes: boolean,
  districts: boolean,
  user_type: boolean,
  votes_evolution: boolean,
  export: boolean,
  server_side_rendering: boolean,
  zipcode_at_register: boolean,
  consultation_plan: boolean,
  display_map: boolean,
};
export type FeatureToggle =
  | 'blog'
  | 'calendar'
  | 'captcha'
  | 'consent_external_communication'
  | 'consent_internal_communication'
  | 'restrict_registration_via_email_domain'
  | 'login_facebook'
  | 'login_gplus'
  | 'login_saml'
  | 'login_paris'
  | 'members_list'
  | 'newsletter'
  | 'privacy_policy'
  | 'profiles'
  | 'projects_form'
  | 'project_trash'
  | 'search'
  | 'share_buttons'
  | 'shield_mode'
  | 'registration'
  | 'phone_confirmation'
  | 'reporting'
  | 'themes'
  | 'districts'
  | 'user_type'
  | 'votes_evolution'
  | 'export'
  | 'server_side_rendering'
  | 'new_feature_questionnaire_result'
  | 'zipcode_at_register'
  | 'consultation_plan'
  | 'display_map';

export type Action =
  | ProposalAction
  | OpinionAction
  | UserAction
  | ProjectAction
  | ReportAction
  | DefaultAction
  | EventAction
  | ReduxFormAction
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
