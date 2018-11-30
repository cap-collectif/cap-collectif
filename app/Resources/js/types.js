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
export type VoteValue = -1 | 0 | 1;
export type Opinion = { id: Uuid };
export type Version = { id: Uuid, parent: Object };
export type OpinionAndVersion = Opinion | Version;

export type FeatureToggles = {
  blog: boolean,
  calendar: boolean,
  captcha: boolean,
  consent_external_communication: boolean,
  login_facebook: boolean,
  login_gplus: boolean,
  login_saml: boolean,
  login_paris: boolean,
  login_openid: boolean,
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
  | 'restrict_registration_via_email_domain'
  | 'login_facebook'
  | 'login_gplus'
  | 'login_saml'
  | 'login_paris'
  | 'members_list'
  | 'newsletter'
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

export type GlobalState = {
  form: Object,
  default: DefaultState,
  proposal: ProposalState,
  project: ProjectState,
  report: ReportState,
  user: UserState,
  opinion: OpinionState,
  event: EventState,
};
export type State = GlobalState;

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;

export type BorderStyle = {
  isEnable: boolean,
  color: string,
  opacity: number,
  size: number,
};

export type BackgroundStyle = {
  isEnable: boolean,
  color: string,
  opacity: number,
};

export type District = {
  id: string,
  name: string,
  geojson: ?string,
  displayedOnMap: boolean,
  border: ?BorderStyle,
  background: ?BackgroundStyle,
};
