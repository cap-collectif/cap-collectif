/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { NavbarRight } from './NavbarRight';
import { intlMock } from '../../mocks';
import { features } from '../../redux/modules/default';

const props = {
  user: null,
  features,
  intl: intlMock,
  loginWithOpenId: true,
};

describe('<NavbarRight />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<NavbarRight {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
