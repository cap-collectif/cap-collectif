import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import LocalStorageService from '../services/LocalStorageService';
import { reducer as reportReducer } from '../redux/modules/report';

export default function configureStore(props) {
  if (props.user === null) {
    LocalStorageService.remove('jwt');
  }

  const reducers = {
    default: () => props,
    report: reportReducer,
    form: formReducer,
  };

  const reducer = combineReducers(reducers);
  return createStore(
    reducer,
    undefined,
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  );
}
