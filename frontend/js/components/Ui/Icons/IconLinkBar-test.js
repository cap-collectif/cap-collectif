// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import IconLinkBar from './IconLinkBar';

describe('<IconLinkBar />', () => {
  it('renders correctly', () => {
    const props = {
      url: '/url',
      message: 'capco.message',
      color: 'black',
    };
    const wrapper = shallow(<IconLinkBar {...props}>IconToRender</IconLinkBar>);
    expect(wrapper).toMatchSnapshot();
  });
});
