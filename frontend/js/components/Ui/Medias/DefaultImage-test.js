/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { DefaultImage } from './DefaultImage';

const props = {
  width: '600px',
  height: '400px',
};

describe('<DefaultImage />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <DefaultImage>
        <img src="" alt="" />
      </DefaultImage>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size', () => {
    const wrapper = shallow(
      <DefaultImage {...props}>
        <img src="" alt="" />
      </DefaultImage>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
