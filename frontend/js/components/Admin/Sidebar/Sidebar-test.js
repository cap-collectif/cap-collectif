// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import { Sidebar } from './Sidebar';
import MockProviders from '~/testUtils';
import { features } from '~/redux/modules/default';

describe('<Sidebar />', () => {
  it('renders correctly', () => {
    const wrapper = render(
      <MockProviders store={{ default: { features } }}>
        <Sidebar appVersion="2020.07.07-xsinjdic" />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
