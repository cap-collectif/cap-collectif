// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { TabsBar } from './TabsBar';
import { intlMock } from '../../../mocks';

describe('<TabsBar />', () => {

  const props = {
      intl: intlMock,
      items: [],
      overflowEnable: false,
      vertical: false,
  };

  it('should render', () => {
    const wrapper = shallow(
      <TabsBar {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
