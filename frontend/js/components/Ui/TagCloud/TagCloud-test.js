/* @flow */
/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import TagCloud from './TagCloud';

describe('<TagCloud />', () => {
  it('should render correctly', () => {
    global.Math.random = () => 0.5;
    const data = [
      {
        tag: { value: 'Amélioratioon', count: 325, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
      {
        tag: { value: 'infrastructures', count: 301, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
      {
        tag: { value: 'françaises', count: 300, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
      {
        tag: { value: 'outre-mer', count: 290, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
      {
        tag: { value: 'mise', count: 70, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
      {
        tag: { value: 'Faible', count: 65, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
      {
        tag: { value: 'Niveau', count: 50, onClick: () => {} },
        marginBottom: -1 * Math.floor(Math.random() * 25),
      },
    ];
    const wrapper = mount(<TagCloud minSize={12} maxSize={45} tags={data} />);
    expect(wrapper).toMatchSnapshot();
  });
});
