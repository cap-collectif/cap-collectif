// @flow
/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { Body } from './Body';
import { theme, withoutMetrics } from '../../../stories/mocks/theme';

describe('<Body />', () => {
  it('should rendly correctly', () => {
    const wrapper = shallow(<Body {...theme} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render without metrics', () => {
    const wrapper = shallow(<Body {...withoutMetrics} />);
    expect(wrapper).toMatchSnapshot();
  });
});
