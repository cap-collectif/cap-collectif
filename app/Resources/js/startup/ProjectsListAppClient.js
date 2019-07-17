// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import ProjectsList from '../components/Project/List/ProjectsList';

type Props = {|
  limit?: number,
  paginate?: boolean,
  themeId?: string,
  authorId?: string,
|};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectsList {...props} />
    </IntlProvider>
  </Provider>
);
