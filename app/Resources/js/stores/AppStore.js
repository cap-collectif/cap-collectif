import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import LocalStorageService from '../services/LocalStorageService';
import { reducer as reportReducer } from '../redux/modules/report';
import { reducer as projectReducer } from '../redux/modules/project';

export default function configureStore(initialState) {
  if (initialState.default.user === null) {
    LocalStorageService.remove('jwt');
  }

  const reducers = {
    default: () => initialState.default,
    project: projectReducer,
    report: reportReducer,
    form: formReducer,
  };

  const reducer = combineReducers(reducers);
  return createStore(
    reducer,
    initialState,
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  );
}
