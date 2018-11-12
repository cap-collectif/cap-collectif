// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import HoverObserver from './HoverObserver';

describe('<HoverObserver />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <HoverObserver>
        <div className="foo" />
      </HoverObserver>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
