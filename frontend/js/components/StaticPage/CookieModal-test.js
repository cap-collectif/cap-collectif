// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CookieModal } from './CookieModal';

describe('<CookieModal />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CookieModal />);
    expect(wrapper).toMatchSnapshot();
  });
});
