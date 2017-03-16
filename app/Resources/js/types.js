// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import type { State as ProposalState, ProposalAction } from './redux/modules/proposal';
import type { State as OpinionState, OpinionAction } from './redux/modules/opinion';
import type { State as UserState, UserAction } from './redux/modules/user';
import type { State as ProjectState, ProjectAction } from './redux/modules/project';
import type { State as IdeaState, IdeaAction } from './redux/modules/idea';
import type { State as ReportState, ReportAction } from './redux/modules/report';
import type { State as DefaultState, DefaultAction } from './redux/modules/default';

export type Exact<T> = T & $Shape<T>;
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
  | DefaultAction
;

export type State = {
  form: Object,
  default: DefaultState,
  idea: IdeaState,
  proposal: ProposalState,
  project: ProjectState,
  report: ReportState,
  user: UserState,
  opinion: OpinionState
};

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;
