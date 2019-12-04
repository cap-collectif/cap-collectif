/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Image } from './Image';

const props = {
  src: 'https://source.unsplash.com/collection/1353633',
  width: '600px',
  height: '400px',
  objectFit: 'none',
  alt: 'my alternative',
  className: 'myClass',
};

describe('<Image />', () => {
  it('should render correctly default Image', () => {
    const wrapper = shallow(<Image src="https://source.unsplash.com/collection/1353633" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other props', () => {
    const wrapper = shallow(<Image {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
