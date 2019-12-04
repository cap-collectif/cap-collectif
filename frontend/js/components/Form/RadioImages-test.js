// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { RadioImages } from './RadioImages';

describe('<RadioImages />', () => {
  const medias = [
    { id: '24-op', image: { id: '1-img', name: 'Red', url: '/red.png' } },
    { id: '25-op', image: { id: '2-img', name: 'Blue', url: '/blue.jpg' } },
    { id: '26-op', image: { id: '3-img', name: 'Yellow', url: '/yellow.svg' } },
  ];

  const props = {
    value: { id: 'initial', image: { id: '12-img', name: 'Purple', url: '/purple.png' } },
    onChange: jest.fn(),
  };

  it('should render a simple div whith no media passed', () => {
    const wrapper = shallow(<RadioImages {...props} medias={[]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly whith media passed', () => {
    const wrapper = shallow(<RadioImages {...props} medias={medias} />);
    expect(wrapper).toMatchSnapshot();
  });
});
