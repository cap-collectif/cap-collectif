// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import WYSIWYGRender from './WYSIWYGRender';

const props = {
  value: '<div>Little test</div>',
  className: 'myClass',
};

describe('<WYSIWYGRender />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<WYSIWYGRender {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with tagName', () => {
    const wrapper = shallow(<WYSIWYGRender {...props} />);
    wrapper.setProps({ tagName: 'i' });
    expect(wrapper).toMatchSnapshot();
  });
});
