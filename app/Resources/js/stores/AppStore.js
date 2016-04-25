import { createStore } from 'redux';

export default function configureStore(props) {
  // This is how we get initial props from Symfony into redux.
  const { features, user } = props;

  const initialState = {
    features,
    user,
  };

  return createStore(() => initialState);
}
