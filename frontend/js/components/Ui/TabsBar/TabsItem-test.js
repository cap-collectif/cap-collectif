// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import TabsItem from './TabsItem';
import { intlMock } from '../../../mocks';

describe('<TabsItem />', () => {
  const props = {
    intl: intlMock,
    item: {},
    vertical: false,
  };

  it('should render', () => {
    const wrapper = shallow(<TabsItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
