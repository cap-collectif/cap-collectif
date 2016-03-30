/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import IntlData from '../../../translations/FR';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import CountersNav from './CountersNav';

describe('<CountersNav />', () => {
  const counters = {
    contributions: 2,
    votes: 50,
    remainingDays: 4,
  };

  it('should render a Nav and correct amount of CounterNavItem', () => {
    const wrapper = shallow(<CountersNav counters={counters} {...IntlData} />);
    const nav = wrapper.find('Nav');
    expect(nav).to.have.length(1);
    expect(nav.find('CounterNavItem')).to.have.length(3);
  });

  it('should not render anything when counters is empty', () => {
    const wrapper = shallow(<CountersNav counters={{}} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });
});
