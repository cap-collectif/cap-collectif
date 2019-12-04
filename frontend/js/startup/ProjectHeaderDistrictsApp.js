// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';

import IntlProvider from './IntlProvider';
import ProjectHeaderDistricts from '../components/Project/ProjectHeaderDistricts';
import type { Uuid } from '../types';

type Props = {
  projectId: Uuid,
};

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <ProjectHeaderDistricts {...props} />
    </IntlProvider>
  </Provider>
);
