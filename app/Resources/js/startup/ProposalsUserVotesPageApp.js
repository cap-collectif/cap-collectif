import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import ProposalsUserVotesPage from '../components/Project/Votes/ProposalsUserVotesPage';

const mainNode = props => {
  const store = ReactOnRails.getStore('appStore');

  return (
    <Provider store={store}>
      <IntlProvider>
        <ProposalsUserVotesPage {...props} />
      </IntlProvider>
    </Provider>
  );
};

export default mainNode;
