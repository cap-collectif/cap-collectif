// @flow
import { compose, createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { intlReducer } from 'react-intl-redux';
import LocalStorageService from '~/services/LocalStorageService';
import { reducer as reportReducer } from '~/redux/modules/report';
import { reducer as projectReducer } from '~/redux/modules/project';
import {
  reducer as proposalReducer,
  initialState as proposalInitialState,
} from '~/redux/modules/proposal';
import { reducer as opinionReducer } from '~/redux/modules/opinion';
import { reducer as userReducer } from '~/redux/modules/user';
import { reducer as defaultReducer } from '~/redux/modules/default';
import { reducer as eventReducer } from '~/redux/modules/event';
import { reducer as languageReducer } from '~/redux/modules/language';

import type { Store, GlobalState } from '~/types';

export default function configureStore(initialState: GlobalState): Store {
  // $FlowExpectedError not writable
  initialState.intl = {};
  initialState.intl.locale = window.locale;
  initialState.intl.messages = window.intl_messages;
  if (
    initialState.project &&
    initialState.proposal &&
    initialState.project.currentProjectStepById &&
    LocalStorageService.isValid('proposal.filtersByStep')
  ) {
    const filtersByStep: ?Object = LocalStorageService.get('proposal.filtersByStep');
    if (filtersByStep) {
      // $FlowExpectedError not writable
      initialState.proposal.filters = filtersByStep[initialState.project.currentProjectStepById];
    }
  }
  if (initialState.project && initialState.project.currentProjectStepById) {
    const urlSearch = new URLSearchParams(window.location.search);
    if (urlSearch) {
      const themeId: ?string = urlSearch.get('theme') || null;
      if (themeId) {
        // $FlowExpectedError not writable
        proposalInitialState.filters.themes = themeId;
      }
      const categoryId: ?string = urlSearch.get('category') || null;
      if (categoryId) {
        // $FlowExpectedError not writable
        proposalInitialState.filters.categories = categoryId;
      }
      const statusId: ?string = urlSearch.get('status') || null;
      if (statusId) {
        // $FlowExpectedError not writable
        proposalInitialState.filters.statuses = statusId;
      }
      const typeId: ?string = urlSearch.get('type') || null;
      if (typeId) {
        // $FlowExpectedError not writable
        proposalInitialState.filters.types = typeId;
      }
      const districtId: ?string = urlSearch.get('district') || null;
      if (districtId) {
        // $FlowExpectedError not writable
        proposalInitialState.filters.districts = districtId;
      }
    }
  }
  if (
    initialState.project &&
    initialState.proposal &&
    initialState.project.currentProjectStepById &&
    LocalStorageService.isValid('proposal.termsByStep')
  ) {
    const termsByStep: ?Object = LocalStorageService.get('proposal.termsByStep');
    if (termsByStep) {
      // $FlowExpectedError not writable
      initialState.proposal.terms = termsByStep[initialState.project.currentProjectStepById];
    }
  }
  if (
    initialState.project &&
    initialState.proposal &&
    initialState.project.currentProjectStepById &&
    LocalStorageService.isValid('proposal.orderByStep')
  ) {
    const orderByStep: ?Object = LocalStorageService.get('proposal.orderByStep');
    if (orderByStep) {
      // $FlowExpectedError not writable
      initialState.proposal.order = orderByStep[initialState.project.currentProjectStepById];
    }
  }
  if (
    initialState.project &&
    initialState.project.showConsultationPlanById &&
    LocalStorageService.isValid('project.showConsultationPlanById')
  ) {
    const showConsultationPlanById: ?Object = LocalStorageService.get(
      'project.showConsultationPlanById',
    );
    if (showConsultationPlanById) {
      // $FlowExpectedError not writable
      initialState.project.showConsultationPlanById = showConsultationPlanById;
    }
  }

  const reducers = {
    intl: intlReducer,
    default: defaultReducer,
    proposal: proposalReducer,
    project: projectReducer,
    event: eventReducer,
    report: reportReducer,
    user: userReducer,
    opinion: opinionReducer,
    language: languageReducer,
    // $FlowFixMe
    form: formReducer.plugin({
      login: (state, action) => {
        switch (action.type) {
          case '@@redux-form/STOP_SUBMIT':
            if (action.payload && action.payload.showCaptcha) {
              return { ...state, values: { ...state.values, displayCaptcha: true } };
            }
            return state;
          default:
            return state;
        }
      },
    }),
  };

  // $FlowExpectedError not writable
  initialState.proposal = { ...proposalInitialState, ...initialState.proposal };

  const reducer = combineReducers(reducers);
  const store = createStore(
    reducer,
    initialState,
    compose(
      typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : f => f,
    ),
  );

  return store;
}
