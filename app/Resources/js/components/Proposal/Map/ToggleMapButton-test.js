// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../../mocks';

import { ToggleMapButton } from './ToggleMapButton';

describe('<ToggleMapButton />', () => {
  const onChange = () => {};
  const mode = {
    mosaic: 'mosaic',
    map: 'map',
  };

  it('should render a toggle button with mosaic selected', () => {
    const wrapper = shallow(
      <ToggleMapButton
        onChange={onChange}
        showMapButton
        mode={mode.mosaic}
        step={{ allowingProgressSteps: true, id: 'id', $refType }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a toggle button with map selected and without table list', () => {
    const wrapper = shallow(
      <ToggleMapButton
        onChange={onChange}
        showMapButton
        mode={mode.map}
        step={{ allowingProgressSteps: false, id: 'id', $refType }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a toggle button without map', () => {
    const wrapper = shallow(
      <ToggleMapButton
        onChange={onChange}
        showMapButton={false}
        mode={mode.map}
        step={{ allowingProgressSteps: false, id: 'id', $refType }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
