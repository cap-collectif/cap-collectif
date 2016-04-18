import { createStore } from 'redux';

export default function configureStore(props) {
  return createStore(() => props);
}
