// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { ProposalListToggleViewBtn } from './ProposalListToggleViewBtn';
import { intlMock } from '../../../mocks';

describe('<ProposalListToggleViewBtn />', () => {
  const onChange = () => {};

  it('should render a toggle button with mosaic selected', () => {
    const wrapper = shallow(
      <ProposalListToggleViewBtn onChange={onChange} showMapButton mode="mosaic" intl={intlMock} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a toggle button with map selected', () => {
    const wrapper = shallow(
      <ProposalListToggleViewBtn onChange={onChange} showMapButton mode="map" intl={intlMock} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a toggle button without map & with table selected', () => {
    const wrapper = shallow(
      <ProposalListToggleViewBtn
        onChange={onChange}
        showMapButton={false}
        mode="table"
        intl={intlMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
