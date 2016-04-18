/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import LoginButton from './LoginButton';
import IntlData from '../../../translations/FR';

describe('<LoginButton />', () => {
  const props = {
    ...IntlData,
  };

  it('renders a button', () => {
    const wrapper = shallow(<LoginButton {...props} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('Button').prop('bsStyle')).to.equal('default');
    expect(wrapper.find('Button').prop('className')).to.equal('btn-darkest-gray navbar-btn btn--connection');
    expect(wrapper.find('Button').prop('onClick')).to.be.a('function');
  });
});
