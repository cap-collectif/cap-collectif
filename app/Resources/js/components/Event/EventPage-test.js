// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPage } from './EventPage';

describe('<EventPage />', () => {
  it('renders correcty', () => {
    const wrapper = shallow(<EventPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
