// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RadioButton from './RadioButton';

describe('<RadioButton />', () => {
  const inputs = [
    {
      key: '0',
      title: 'Title',
      content: 'content with text and images and links etc',
    },
    {
      key: '1',
      title: 'Title 2',
      content: 'more content with more text and more images and more links etc',
    },
    {
      key: '2',
      title: 'Title 3',
      content: 'extra content with extra text and extra images and extra links etc',
    },
  ];
  const props = {
    inputs,
    id: 'superId',
    name: 'Jpec',
    value: 'YouvDee',
    defaultActiveKey: '1',
    color: '#ff0000'
  };
  it('should render the radio button', () => {
    const wrapper = shallow(<RadioButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
