// @flow
import { SubmissionError } from 'redux-form';
import Fetcher from '../../services/Fetcher';
import type { Exact, Action, Dispatch, FeatureToggle, FeatureToggles } from '../../types';
import {
  addRegistrationFieldSucceeded,
  updateRegistrationFieldSucceeded,
  deleteRegistrationFieldSucceeded,
} from './user';

type ShowNewFieldModalAction = { type: 'default/SHOW_NEW_FIELD_MODAL' };
type HideNewFieldModalAction = { type: 'default/HIDE_NEW_FIELD_MODAL' };
type ToggleFeatureSucceededAction = {
  type: 'default/TOGGLE_FEATURE_SUCCEEDED',
  feature: string,
  enabled: boolean,
};
type ShowUpdateFieldModalAction = {
  type: 'default/SHOW_UPDATE_FIELD_MODAL',
  id: number,
};
type HideUpdateFieldModalAction = { type: 'default/HIDE_UPDATE_FIELD_MODAL' };

export type DefaultAction =
  | ToggleFeatureSucceededAction
  | ShowNewFieldModalAction
  | ShowUpdateFieldModalAction
  | HideUpdateFieldModalAction
  | HideNewFieldModalAction;
export type State = {
  +showNewFieldModal: boolean,
  +themes: Array<Object>,
  +images: ?{
    +avatar: string,
  },
  +features: Exact<FeatureToggles>,
  +userTypes: Array<Object>,
  +parameters: Object,
  +updatingRegistrationFieldModal: ?number,
};

export const features = {
  login_saml: false,
  login_paris: false,
  blog: false,
  calendar: false,
  ideas: false,
  idea_creation: false,
  idea_trash: false,
  login_facebook: false,
  login_gplus: false,
  members_list: false,
  captcha: false,
  consent_external_communication: false,
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
  vote_without_account: false,
};

const initialState: State = {
  themes: [],
  images: null,
  showNewFieldModal: false,
  features,
  userTypes: [],
  parameters: {},
  updatingRegistrationFieldModal: null,
};

export const toggleFeatureSucceeded = (
  feature: FeatureToggle,
  enabled: boolean,
): ToggleFeatureSucceededAction => ({
  type: 'default/TOGGLE_FEATURE_SUCCEEDED',
  feature,
  enabled,
});
export const showNewFieldModal = (): ShowNewFieldModalAction => ({
  type: 'default/SHOW_NEW_FIELD_MODAL',
});
export const hideNewFieldModal = (): HideNewFieldModalAction => ({
  type: 'default/HIDE_NEW_FIELD_MODAL',
});
export const updateRegistrationFieldModal = (id: number): ShowUpdateFieldModalAction => ({
  type: 'default/SHOW_UPDATE_FIELD_MODAL',
  id,
});
export const hideRegistrationFieldModal = (): HideUpdateFieldModalAction => ({
  type: 'default/HIDE_UPDATE_FIELD_MODAL',
});

export const requestUpdateRegistrationField = (
  values: Object,
  dispatch: Dispatch,
  { fieldId }: { fieldId: number },
) => {
  return Fetcher.putToJson(`/registration_form/questions/${fieldId}`, values).then(
    (question: Object) => {
      dispatch(hideRegistrationFieldModal());
      dispatch(updateRegistrationFieldSucceeded(fieldId, question));
    },
    () => {
      throw new SubmissionError({ _error: 'Un problème est survenu' });
    },
  );
};

export const updateRegistrationCommunicationForm = (values: Object) => {
  return Fetcher.put('/registration_form', values).then(
    () => {},
    () => {
      throw new SubmissionError({ _error: 'Un problème est survenu' });
    },
  );
};

export const addNewRegistrationField = (values: Object, dispatch: Dispatch) => {
  if (values.type !== '4') {
    delete values.choices;
  }
  return Fetcher.postToJson('/registration_form/questions', values).then(
    (question: Object) => {
      dispatch(hideNewFieldModal());
      dispatch(addRegistrationFieldSucceeded(question));
    },
    () => {
      throw new SubmissionError({ _error: 'Un problème est survenu' });
    },
  );
};

export const deleteRegistrationField = (id: number, dispatch: Dispatch) => {
  // eslint-disable-next-line no-alert
  if (window.confirm('Confirmez la suppression ?')) {
    return Fetcher.delete(`/registration_form/questions/${id}`).then(
      () => {
        dispatch(deleteRegistrationFieldSucceeded(id));
      },
      () => {},
    );
  }
};

export const toggleFeature = (
  dispatch: Dispatch,
  feature: FeatureToggle,
  enabled: boolean,
): Promise<*> => {
  return Fetcher.put(`/toggles/${feature}`, { enabled }).then(
    () => {
      dispatch(toggleFeatureSucceeded(feature, enabled));
    },
    () => {},
  );
};

export const reducer = (state: State = initialState, action: Action): Exact<State> => {
  switch (action.type) {
    case '@@INIT':
      return { ...initialState, ...state };
    case 'default/SHOW_UPDATE_FIELD_MODAL':
      return { ...state, updatingRegistrationFieldModal: action.id };
    case 'default/HIDE_UPDATE_FIELD_MODAL':
      return { ...state, updatingRegistrationFieldModal: null };
    case 'default/SHOW_NEW_FIELD_MODAL':
      return { ...state, showNewFieldModal: true };
    case 'default/HIDE_NEW_FIELD_MODAL':
      return { ...state, showNewFieldModal: false };
    case 'default/TOGGLE_FEATURE_SUCCEEDED':
      return {
        ...state,
        features: { ...state.features, [action.feature]: action.enabled },
      };
    default:
      return state;
  }
};
