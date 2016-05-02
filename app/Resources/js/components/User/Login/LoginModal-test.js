/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import LoginModal from './LoginModal';
import IntlData from '../../../translations/FR';

describe('<LoginModal />', () => {
  const props = {
    ...IntlData,
    onClose: () => {},
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<LoginModal show={false} {...props} />);
    expect(wrapper.find('Modal')).to.have.length(1);
    expect(wrapper.find('Modal').prop('show')).to.equal(false);
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<LoginModal show {...props} />);
    expect(wrapper.find('Modal')).to.have.length(1);
    expect(wrapper.find('Modal').prop('show')).to.equal(true);
  });

  it('renders a form', () => {
    const wrapper = shallow(<LoginModal show {...props} />);
    expect(wrapper.find('form')).to.have.length(1);
    expect(wrapper.find('form').prop('id')).to.equal('login-form');
  });
});
