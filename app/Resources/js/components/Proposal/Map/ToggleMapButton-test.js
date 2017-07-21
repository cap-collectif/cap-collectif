/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { ToggleMapButton } from './ToggleMapButton';

describe('<ToggleMapButton />', () => {
  const onChange = () => {};
  const mode = {
    mosaic: 'mosaic',
    map: 'map',
  };

  it('should render a toggle button with mosaic selected', () => {
    const wrapper = shallow(
      <ToggleMapButton onChange={onChange} mode={mode.mosaic} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a toggle button with map selected', () => {
    const wrapper = shallow(
      <ToggleMapButton onChange={onChange} mode={mode.map} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
