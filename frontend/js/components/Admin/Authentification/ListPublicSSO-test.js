// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ListPublicSSO } from './ListPublicSSO';
import { $refType } from '~/mocks';
import { disableFeatureFlags, enableFeatureFlags } from '~/testUtils';

describe('<ListPublicSSO />', () => {
  const props = {
    onToggle: jest.fn(),
    query: {
      ...$refType,
      ssoConfigurations: {
        edges: [],
      },
    },
  };
  afterEach(() => {
    disableFeatureFlags();
  });
  it('renders correctly without France Connect', () => {
    const wrapper = shallow(<ListPublicSSO {...props} query={props.query} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all element with France Connect', () => {
    enableFeatureFlags(['login_franceconnect']);

    const wrapper = shallow(<ListPublicSSO onToggle={jest.fn()} query={props.query} />);
    expect(wrapper).toMatchSnapshot();
  });
});
