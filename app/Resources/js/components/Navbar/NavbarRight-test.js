/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { NavbarRight } from './NavbarRight';
import { intlMock } from '../../mocks';

const props = {
  user: {},
  features: {},
  intl: intlMock,
};

describe('<NavbarRight />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<NavbarRight {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
