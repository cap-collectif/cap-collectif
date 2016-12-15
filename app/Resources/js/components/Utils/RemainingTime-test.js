/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import RemainingTime from './RemainingTime';

describe('<RemainingTime />', () => {
  it('should not render 0 days if no props', () => {
    const wrapper = shallow(<RemainingTime {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage').prop('message')).toContain('jour');
    expect(wrapper.find('FormattedMessage').prop('num')).toEqual(0);
  });

  it('should render the number of days if hours is not provided', () => {
    const wrapper = shallow(<RemainingTime days={2} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage').prop('message')).toContain('jour');
    expect(wrapper.find('FormattedMessage').prop('num')).toEqual(2);
  });

  it('should render the number of hours if provided', () => {
    const wrapper = shallow(<RemainingTime hours={2} {...IntlData} />);
    expect(wrapper.find('FormattedMessage')).toHaveLength(1);
    expect(wrapper.find('FormattedMessage').prop('message')).toContain('heure');
    expect(wrapper.find('FormattedMessage').prop('num')).toEqual(2);
  });
});
