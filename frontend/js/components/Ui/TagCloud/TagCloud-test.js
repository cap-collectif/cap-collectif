/* @flow */
/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import TagCloud from './TagCloud';

describe('<TagCloud />', () => {
  const data = [
    { value: 'Amélioratioon', count: 325 },
    { value: 'infrastructures', count: 301 },
    { value: 'françaises', count: 300 },
    { value: 'outre-mer', count: 290 },
    { value: 'mise', count: 70 },
    { value: 'Faible', count: 65 },
    { value: 'Niveau', count: 50 },
  ];

  it('should render correctly', () => {
    global.Math.random = () => 0.5;
    const wrapper = mount(<TagCloud minSize={12} maxSize={45} tags={data} />);
    expect(wrapper).toMatchSnapshot();
  });
});
