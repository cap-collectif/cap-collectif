import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import IdeasList from '../components/Idea/List/IdeasList';

const mainNode = props => {
  const store = ReactOnRails.getStore('appStore');

  return (
    <Provider store={store}>
      <IntlProvider>
        <IdeasList {...props} />
      </IntlProvider>
    </Provider>
  );
};

export default mainNode;
