/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Label from './Label';

describe('<Label />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Label>Bonjour</Label>);
    expect(wrapper).toMatchSnapshot();
  });
});
