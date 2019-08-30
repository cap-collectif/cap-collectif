// @flow
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { reducer as formReducer } from 'redux-form';
import { intlReducer } from 'react-intl-redux';
import LocalStorageService from '../services/LocalStorageService';
import { reducer as reportReducer } from '../redux/modules/report';
import { reducer as projectReducer } from '../redux/modules/project';
import {
  reducer as proposalReducer,
  saga as proposalSaga,
  initialState as proposalInitialState,
} from '../redux/modules/proposal';
import { reducer as opinionReducer } from '../redux/modules/opinion';
import { reducer as userReducer } from '../redux/modules/user';
import { reducer as defaultReducer } from '../redux/modules/default';
import { reducer as eventReducer } from '../redux/modules/event';
import type { SubmitConfirmPasswordAction } from '../redux/modules/user';
import type { Store } from '../types';

export default function configureStore(initialState: Object): Store {
  initialState.intl = {};
  initialState.intl.locale = window.locale;
  initialState.intl.messages = window.intl_messages;
  if (
    initialState.project &&
    initialState.proposal &&
    initialState.project.currentProjectStepById &&
    LocalStorageService.isValid('proposal.filtersByStep')
  ) {
    const filtersByStep = LocalStorageService.get('proposal.filtersByStep');
    if (filtersByStep) {
      initialState.proposal.filters = filtersByStep[initialState.project.currentProjectStepById];
    }
  }
  if (
    initialState.project &&
    initialState.proposal &&
    initialState.project.currentProjectStepById &&
    LocalStorageService.isValid('proposal.termsByStep')
  ) {
    const termsByStep = LocalStorageService.get('proposal.termsByStep');
    if (termsByStep) {
      initialState.proposal.terms = termsByStep[initialState.project.currentProjectStepById];
    }
  }
  if (
    initialState.project &&
    initialState.proposal &&
    initialState.project.currentProjectStepById &&
    LocalStorageService.isValid('proposal.orderByStep')
  ) {
    const orderByStep = LocalStorageService.get('proposal.orderByStep');
    if (orderByStep) {
      initialState.proposal.order = orderByStep[initialState.project.currentProjectStepById];
    }
  }
  if (
    initialState.project &&
    initialState.project.showConsultationPlanById &&
    LocalStorageService.isValid('project.showConsultationPlanById')
  ) {
    const showConsultationPlanById = LocalStorageService.get('project.showConsultationPlanById');
    if (showConsultationPlanById) {
      initialState.project.showConsultationPlanById = showConsultationPlanById;
    }
  }

  const sagaMiddleware = createSagaMiddleware();

  const reducers = {
    intl: intlReducer,
    default: defaultReducer,
    proposal: proposalReducer,
    project: projectReducer,
    event: eventReducer,
    report: reportReducer,
    user: userReducer,
    opinion: opinionReducer,
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
      account: (state, action: SubmitConfirmPasswordAction) => {
        switch (action.type) {
          case 'SUBMIT_CONFIRM_PASSWORD_FORM':
            return {
              ...state,
              values: { ...state.values, password: action.password },
            };
          default:
            return state;
        }
      },
    }),
  };

  initialState.proposal = { ...proposalInitialState, ...initialState.proposal };

  const reducer = combineReducers(reducers);
  const store = createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(sagaMiddleware),
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
        ? window.devToolsExtension()
        : f => f,
    ),
  );

  sagaMiddleware.run(proposalSaga);

  return store;
}
