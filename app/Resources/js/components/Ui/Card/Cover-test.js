/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Cover } from './Cover';

describe('<Cover />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Cover>
        <img src="" alt="" />
      </Cover>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size', () => {
    const wrapper = shallow(
      <Cover>
        <img src="" alt="" />
      </Cover>,
    );
    wrapper.setProps({ height: '300px', width: '400px' });
    expect(wrapper).toMatchSnapshot();
  });
});
