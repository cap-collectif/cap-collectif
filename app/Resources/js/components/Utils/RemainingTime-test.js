/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import IntlData from '../../translations/FR';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RemainingTime from './RemainingTime';

describe('<RemainingTime />', () => {
  it('should not render 0 days if no props', () => {
    const wrapper = shallow(<RemainingTime {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
    expect(wrapper.find('FormattedMessage').prop('message')).to.contains('jour');
    expect(wrapper.find('FormattedMessage').prop('num')).to.equals(0);
  });

  it('should render the number of days if hours is not provided', () => {
    const wrapper = shallow(<RemainingTime days={2} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
    expect(wrapper.find('FormattedMessage').prop('message')).to.contains('jour');
    expect(wrapper.find('FormattedMessage').prop('num')).to.equals(2);
  });

  it('should render the number of hours if provided', () => {
    const wrapper = shallow(<RemainingTime hours={2} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).to.have.length(1);
    expect(wrapper.find('FormattedMessage').prop('message')).to.contains('heure');
    expect(wrapper.find('FormattedMessage').prop('num')).to.equals(2);
  });
});
