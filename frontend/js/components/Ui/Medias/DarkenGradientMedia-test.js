/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { DarkenGradientMedia } from './DarkenGradientMedia';

const props = {
  url: 'https://source.unsplash.com/collection/1353633',
  width: '600px',
  height: '400px',
  linearGradient: false,
  alt: 'my alternative',
  role: 'img',
};

describe('<DarkenGradientMedia />', () => {
  it('should render correctly default darkenGradientMedia', () => {
    const wrapper = shallow(
      <DarkenGradientMedia url="https://source.unsplash.com/collection/1353633" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other props', () => {
    const wrapper = shallow(
      <DarkenGradientMedia {...props}>
        <p>Test</p>
      </DarkenGradientMedia>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
