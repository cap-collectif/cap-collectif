// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import WYSIWYGRender from './WYSIWYGRender';

const props = {
  value: '<div>Little test</div>',
};

describe('<WYSIWYGRender />', () => {
  it('should render a colored spot when drop is allowed and hovering', () => {
    const wrapper = shallow(<WYSIWYGRender {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
