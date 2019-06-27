// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectHeaderAuthorsView, {
  type Props,
} from '../components/Project/Authors/ProjectHeaderAuthorsView';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectHeaderAuthorsView {...props} />
    </IntlProvider>
  </Provider>
);
