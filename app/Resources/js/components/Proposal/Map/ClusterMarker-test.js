/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ClusterMarker } from './ClusterMarker';

describe('<ClusterMarker />', () => {
  const marker = {
    numPoints: 2,
  };

  it('should render a cluster marker', () => {
    const wrapper = shallow(<ClusterMarker marker={marker} />);
    expect(wrapper).toMatchSnapshot();
  });
});
