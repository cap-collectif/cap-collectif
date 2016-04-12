/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RegistrationButton from './RegistrationButton';
import IntlData from '../../../translations/FR';

describe('<RegistrationButton />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if registration is not activate', () => {
    RegistrationButton.__Rewire__('FeatureStore', {
      isActive: () => false,
    });
    const wrapper = shallow(<RegistrationButton {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if registration is active', () => {
    RegistrationButton.__Rewire__('FeatureStore', {
      isActive: () => true,
    });
    const wrapper = shallow(<RegistrationButton {...props} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('Button').prop('bsStyle')).to.equal('primary');
    expect(wrapper.find('Button').prop('className')).to.equal('navbar-btn btn--registration');
    expect(wrapper.find('Button').prop('onClick')).to.be.a('function');
  });
});
