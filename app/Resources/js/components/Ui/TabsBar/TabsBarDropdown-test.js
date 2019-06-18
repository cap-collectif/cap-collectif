// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import TabsBarDropdown from './TabsBarDropdown';
import { intlMock } from '../../../mocks';

describe('<TabsBarDropdown />', () => {

  const props = {
      intl: intlMock,
      item: {},
      vertical: false,
      pullRight: true,
      id: 'TabsBarDropdown-id',
      toggleElement: null,
      eventKey: 1,
      'aria-label': 'TabsBarDropdown-aria-label',
      children: null,
  };

  it('should render', () => {
    const wrapper = shallow(
      <TabsBarDropdown {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
