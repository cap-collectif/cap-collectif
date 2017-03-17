// @flow
import { SubmissionError } from 'redux-form';
import Fetcher from '../../services/Fetcher';
import type { Exact, Action, Dispatch } from '../../types';
import { deleteRegistrationFieldSucceeded } from './user';

export type FeatureToggles = {
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
  export: boolean,
  server_side_rendering: boolean,
  zipcode_at_register: boolean,
  vote_without_account: boolean
};

type ShowNewFieldModalAction = { type: 'default/SHOW_NEW_FIELD_MODAL' };
type HideNewFieldModalAction = { type: 'default/HIDE_NEW_FIELD_MODAL' };
type ToggleFeatureSucceededAction = { type: 'default/TOGGLE_FEATURE_SUCCEEDED', feature: string, enabled: boolean };
export type DefaultAction =
  ToggleFeatureSucceededAction |
  ShowNewFieldModalAction |
  HideNewFieldModalAction
;
export type State = {
    districts: Array<Object>,
    showNewFieldModal: boolean,
    themes: Array<Object>,
    features: Exact<FeatureToggles>,
    userTypes: Array<Object>,
    parameters: Object
};

const initialState: State = {
  districts: [],
  themes: [],
  showNewFieldModal: false,
  features: {
    login_saml: false,
    blog: false,
    calendar: false,
    ideas: false,
    idea_creation: false,
    idea_trash: false,
    login_facebook: false,
    login_gplus: false,
    members_list: false,
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
    export: false,
    server_side_rendering: false,
    zipcode_at_register: false,
    vote_without_account: false,
  },
  userTypes: [],
  parameters: {},
};

export const toggleFeatureSucceeded = (feature: string, enabled: boolean): ToggleFeatureSucceededAction => ({
  type: 'default/TOGGLE_FEATURE_SUCCEEDED',
  feature,
  enabled,
});
export const showNewFieldModal = (): ShowNewFieldModalAction => ({ type: 'default/SHOW_NEW_FIELD_MODAL' });
export const hideNewFieldModal = (): HideNewFieldModalAction => ({ type: 'default/HIDE_NEW_FIELD_MODAL' });


export const updateRegistrationCommunicationForm = (values: Object) => {
  return Fetcher
    .put('/registration_form', values)
    .then(() => {},
    () => {
      throw new SubmissionError({ _error: 'Un problème est survenu' });
    },
  );
};

export const addNewRegistrationField = (values: Object, dispatch: Dispatch) => {
  return Fetcher
    .post('/registration_form/questions', values)
    .then(() => {
      dispatch(hideNewFieldModal());
      window.location.reload();
    },
    () => {
      throw new SubmissionError({ _error: 'Un problème est survenu' });
    },
  );
};

export const deleteRegistrationField = (id: number, dispatch: Dispatch) => {
  return Fetcher
    .delete(`/registration_form/questions/${id}`)
    .then(() => {
      dispatch(deleteRegistrationFieldSucceeded(id));
      window.location.reload();
    },
    () => {},
  );
};

export const toggleFeature = (dispatch: Dispatch, feature: string, enabled: boolean): Promise<*> => {
  return Fetcher
    .put(`/toggles/${feature}`, { enabled })
    .then(() => {
      dispatch(toggleFeatureSucceeded(feature, enabled));
    }, () => {});
};

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'default/SHOW_NEW_FIELD_MODAL':
      return { ...state, showNewFieldModal: true };
    case 'default/HIDE_NEW_FIELD_MODAL':
      return { ...state, showNewFieldModal: false };
    case 'default/TOGGLE_FEATURE_SUCCEEDED':
      return { ...state, features: { ...state.features, [action.feature]: action.enabled } };
    default:
      return state;
  }
};
