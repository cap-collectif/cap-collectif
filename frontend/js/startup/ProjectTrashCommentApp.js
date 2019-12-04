// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectTrashComment from '../components/Project/ProjectTrashComment';

type Props = {
  projectId?: string,
  isAuthenticated?: boolean,
};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectTrashComment {...props} />
    </IntlProvider>
  </Provider>
);
