// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import type { State as ProposalState, ProposalAction } from './redux/modules/proposal';
import type { State as OpinionState, OpinionAction } from './redux/modules/opinion';
import type { State as UserState, UserAction } from './redux/modules/user';

export type Action =
    ProposalAction
  | OpinionAction
  | UserAction
;

export type FeatureToggles = {
  login_saml: boolean
};

export type State = {
  default: {
    districts: Array<Object>,
    themes: Array<Object>,
    features: FeatureToggles,
    userTypes: Array<Object>,
    parameters: Object,
    isLoggedIn: boolean
  },
  idea: Object,
  proposal: ProposalState,
  project: Object,
  report: Object,
  user: UserState,
  opinion: OpinionState
};

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;
