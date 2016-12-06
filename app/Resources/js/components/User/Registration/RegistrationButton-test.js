/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { RegistrationButton } from './RegistrationButton';
import IntlData from '../../../translations/FR';

describe('<RegistrationButton />', () => {
  const props = {
    ...IntlData,
  };

  const style = { marginTop: '0' };

  it('renders nothing if registration is not activate', () => {
    const wrapper = shallow(<RegistrationButton features={{ registration: false }} {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if registration is active', () => {
    const wrapper = shallow(<RegistrationButton features={{ registration: true }} {...props} />);
    const span = wrapper.find('span');
    expect(span).to.have.length(1);
    const button = span.find('Button');
    expect(button).to.have.length(1);
    expect(button.prop('bsStyle')).to.equal('primary');
    expect(button.prop('className')).to.equal('navbar-btn btn--registration ');
    expect(button.prop('onClick')).to.be.a('function');
  });

  it('renders specified className on button', () => {
    const wrapper = shallow(<RegistrationButton features={{ registration: true }} className="css-class" {...props} />);
    expect(wrapper.find('Button').prop('className')).to.equal('navbar-btn btn--registration css-class');
  });

  it('renders specified style on wrapper', () => {
    const wrapper = shallow(<RegistrationButton features={{ registration: true }} style={style} {...props} />);
    expect(wrapper.find('span').prop('style')).to.equal(style);
    expect(wrapper.find('Button').prop('style')).to.deep.equal({});
  });

  it('renders specified button style on button', () => {
    const wrapper = shallow(<RegistrationButton features={{ registration: true }} buttonStyle={style} {...props} />);
    expect(wrapper.find('span').prop('style')).to.deep.equal({});
    expect(wrapper.find('Button').prop('style')).to.equal(style);
  });
});
