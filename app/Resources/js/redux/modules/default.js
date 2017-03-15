// @flow
import Fetcher from '../../services/Fetcher';
import type { Action, Dispatch } from '../../types';

export type FeatureToggles = {|
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
  export: boolean,
  server_side_rendering: boolean,
  zipcode_at_register: boolean,
  vote_without_account: boolean
|};

type ToggleFeatureSucceededAction = { type: 'default/TOGGLE_FEATURE_SUCCEEDED', feature: string, enabled: boolean };
export type DefaultAction = ToggleFeatureSucceededAction;

export type State = {
    districts: Array<Object>,
    themes: Array<Object>,
    features: FeatureToggles,
    userTypes: Array<Object>,
    parameters: Object
};

export const toggleFeatureSucceeded = (feature: string, enabled: boolean): ToggleFeatureSucceededAction => ({
  type: 'default/TOGGLE_FEATURE_SUCCEEDED',
  feature,
  enabled,
});

export const toggleFeature = (dispatch: Dispatch, feature: string, enabled: boolean): Promise<*> => {
  return Fetcher
    .put(`/toggles/${feature}`, { enabled })
    .then(() => {
      dispatch(toggleFeatureSucceeded(feature, enabled));
    }, () => {});
};

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    default:
      return state;
  }
};
