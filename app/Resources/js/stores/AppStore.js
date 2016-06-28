import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import LocalStorageService from '../services/LocalStorageService';

export default function configureStore(props) {
  if (props.user === null) {
    LocalStorageService.remove('jwt');
  }

  const reducers = {
    default: () => props,
    form: formReducer,
  };

  const reducer = combineReducers(reducers);
  return createStore(reducer);
}
