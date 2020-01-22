/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Context from './Context';

describe('<Context />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Context onDragEnd={() => {}}>Bonjour</Context>);
    expect(wrapper).toMatchSnapshot();
  });
});
