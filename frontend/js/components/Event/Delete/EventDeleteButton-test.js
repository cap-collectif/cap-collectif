// @flow
/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { EventDeleteButton } from './EventDeleteButton';

describe('<EventDeleteButton />', () => {
  it('it renders correctly', () => {
    const wrapper = shallow(<EventDeleteButton eventId="1" />);
    expect(wrapper).toMatchSnapshot();
  });
});
