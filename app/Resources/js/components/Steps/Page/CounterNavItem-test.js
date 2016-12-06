/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import CounterNavItem from './CounterNavItem';

describe('<CounterNavItem />', () => {
  const props = {
    counter: 2,
    icon: 'cap cap-hand-1-2',
    label: 'blabla',
  };
  it('should render a li, an icon, a value and a label', () => {
    const wrapper = shallow(<CounterNavItem {...props} />);
    expect(wrapper.find('li')).to.have.length(1);
    expect(wrapper.find('i')).to.have.length(1);
    expect(wrapper.find('span.value')).to.have.length(1);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
  });
});
