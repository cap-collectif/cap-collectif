import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { reducer as formReducer } from 'redux-form';
import LocalStorageService from '../services/LocalStorageService';
import { reducer as reportReducer } from '../redux/modules/report';
import { reducer as projectReducer, saga as projectSaga } from '../redux/modules/project';
import { reducer as ideaReducer, saga as ideaSaga } from '../redux/modules/idea';
import { reducer as proposalReducer, saga as proposalSaga } from '../redux/modules/proposal';
import { reducer as opinionReducer, saga as opinionSaga } from '../redux/modules/opinion';

export default function configureStore(initialState) {
  if (initialState.default.user === null) {
    LocalStorageService.remove('jwt');
  }

  const sagaMiddleware = createSagaMiddleware();

  const reducers = {
    default: () => initialState.default,
    idea: ideaReducer,
    proposal: proposalReducer,
    project: projectReducer,
    report: reportReducer,
    form: formReducer,
    opinion: opinionReducer,
  };

  const reducer = combineReducers(reducers);
  const store = createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(sagaMiddleware),
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    )
  );

  sagaMiddleware.run(ideaSaga);
  sagaMiddleware.run(proposalSaga);
  sagaMiddleware.run(projectSaga);
  sagaMiddleware.run(opinionSaga);

  return store;
}
