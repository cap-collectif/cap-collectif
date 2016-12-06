/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeasIndexHeader from './IdeasIndexHeader';

const description = '<p>blabla</p>';

describe('<IdeasIndexHeader />', () => {
  it('should render ideas index description when provided', () => {
    const wrapper = shallow(<IdeasIndexHeader description={description} {...IntlData} />);
    expect(wrapper.find('.container')).to.have.length(1);
    const message = wrapper.find('FormattedHTMLMessage');
    expect(message).to.have.length(1);
    expect(message.prop('message')).to.equal(description);
  });

  it('should render empty container when description is not provided', () => {
    const wrapper = shallow(<IdeasIndexHeader {...IntlData} />);
    expect(wrapper.find('.container')).to.have.length(1);
    expect(wrapper.find('.container').children()).to.have.length(0);
  });
});
