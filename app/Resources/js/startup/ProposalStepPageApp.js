// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProposalStepPage from '../components/Page/ProposalStepPage';

type Props = {|
  stepId: string,
  count: number,
|};

const mainNode = (props: Props) => {
  const store = ReactOnRails.getStore('appStore');

  return (
    <Provider store={store}>
      <IntlProvider>
        {/* $FlowFixMe  */}
        <ProposalStepPage {...props} />
      </IntlProvider>
    </Provider>
  );
};

export default mainNode;
