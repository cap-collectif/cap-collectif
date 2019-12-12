/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import List from './List';

describe('<List />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<List id="1">Bonjour</List>);
    expect(wrapper).toMatchSnapshot();
  });
});
