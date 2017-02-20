// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import type { State as ProposalState, ProposalAction } from './redux/modules/proposal';
import type { State as OpinionState, OpinionAction } from './redux/modules/opinion';
import type { State as UserState, UserAction } from './redux/modules/user';
import type { State as ProjectState, ProjectAction } from './redux/modules/project';
import type { State as IdeaState, IdeaAction } from './redux/modules/idea';
import type { State as ReportState, ReportAction } from './redux/modules/report';

export type Uuid = string;
export type VoteValue = -1 | 0 | 1;
export type Opinion = { id: Uuid };
export type Version = { id: Uuid, parent: Object };
export type OpinionAndVersion = Opinion | Version;

export type Action =
    ProposalAction
  | OpinionAction
  | UserAction
  | ProjectAction
  | IdeaAction
  | ReportAction
;

export type FeatureToggles = {
  login_saml: boolean,
  blog: boolean,
  calendar: boolean,
  ideas: boolean,
  idea_creation: boolean,
  idea_trash: boolean,
  login_facebook: boolean,
  login_gplus: boolean,
  login_saml: boolean,
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
  reporting: boolean,
  themes: boolean,
  districts: boolean,
  user_type: boolean,
  votes_evolution: boolean,
  server_side_rendering: boolean,
  zipcode_at_register: boolean,
  vote_without_account: boolean
};

export type State = {
  form: Object,
  default: {
    districts: Array<Object>,
    themes: Array<Object>,
    features: FeatureToggles,
    userTypes: Array<Object>,
    parameters: Object,
    isLoggedIn: boolean
  },
  idea: IdeaState,
  proposal: ProposalState,
  project: ProjectState,
  report: ReportState,
  user: UserState,
  opinion: OpinionState
};

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;
