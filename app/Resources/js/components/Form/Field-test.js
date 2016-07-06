/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Field } from './Field';
import IntlData from '../../translations/FR';

describe('<Field />', () => {
  const defaultProps = {
    type: 'text',
    name: 'name',
    label: 'label',
    touched: false,
    ...IntlData,
  };

  // errors: '',

  it('renders a default <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('type')).to.equal(defaultProps.type);
    expect(wrapper.prop('label')).to.equal(defaultProps.label);
    expect(wrapper.prop('labelClassName')).to.equal('');
    expect(wrapper.prop('placeholder')).to.be.null;
    expect(wrapper.prop('errors')).to.be.null;
    expect(wrapper.prop('bsStyle')).to.be.null;
    expect(wrapper.prop('hasFeedback')).to.be.false;
  });

  it('renders a validated <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} touched />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('type')).to.equal(defaultProps.type);
    expect(wrapper.prop('label')).to.equal(defaultProps.label);
    expect(wrapper.prop('labelClassName')).to.equal('');
    expect(wrapper.prop('placeholder')).to.be.null;
    expect(wrapper.prop('errors')).to.be.null;
    expect(wrapper.prop('bsStyle')).to.equal('success');
    expect(wrapper.prop('hasFeedback')).to.be.true;
  });

  it('renders an errored <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} touched error="global.required" />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('type')).to.equal(defaultProps.type);
    expect(wrapper.prop('label')).to.equal(defaultProps.label);
    expect(wrapper.prop('labelClassName')).to.equal('');
    expect(wrapper.prop('placeholder')).to.be.null;
    expect(wrapper.prop('errors')).to.equal('Cette valeur est requise.');
    expect(wrapper.prop('bsStyle')).to.equal('error');
    expect(wrapper.prop('hasFeedback')).to.be.true;
  });

  it('renders a validation disabled <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} disableValidation touched />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('type')).to.equal(defaultProps.type);
    expect(wrapper.prop('label')).to.equal(defaultProps.label);
    expect(wrapper.prop('labelClassName')).to.equal('');
    expect(wrapper.prop('placeholder')).to.be.null;
    expect(wrapper.prop('errors')).to.be.null;
    expect(wrapper.prop('bsStyle')).to.be.null;
    expect(wrapper.prop('hasFeedback')).to.be.false;
  });
});
