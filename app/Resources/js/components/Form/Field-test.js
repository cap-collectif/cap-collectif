/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Field from './Field';
import IntlData from '../../translations/FR';

describe('<Field />', () => {
  const defaultProps = {
    id: 'id',
    type: 'text',
    input: {
      autoFocus: false,
      name: 'name',
      label: 'label',
    },
    meta: {
      touched: false,
    },
    ...IntlData,
  };

  it('pass input props to children', () => {
    const wrapper = shallow(<Field {...defaultProps} />);
    expect(wrapper.prop('type')).to.equal(defaultProps.type);
    expect(wrapper.prop('label')).to.equal(defaultProps.input.label);
    expect(wrapper.prop('id')).to.equal(defaultProps.id);
    expect(wrapper.prop('autoFocus')).to.equal(defaultProps.input.autoFocus);
    expect(wrapper.prop('labelClassName')).to.equal('');
    expect(wrapper.prop('placeholder')).to.be.null;
  });

  it('renders a default <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('errors')).to.be.null;
    expect(wrapper.prop('bsStyle')).to.be.null;
    expect(wrapper.prop('hasFeedback')).to.be.false;
  });

  it('renders a validated <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} meta={{ touched: true }} />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('errors')).to.be.null;
    expect(wrapper.prop('bsStyle')).to.equal('success');
    expect(wrapper.prop('hasFeedback')).to.be.true;
  });

  it('renders an errored <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} meta={{ touched: true, error: 'global.required' }} />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('errors')).to.equal('Cette valeur est requise.');
    expect(wrapper.prop('bsStyle')).to.equal('error');
    expect(wrapper.prop('hasFeedback')).to.be.true;
  });

  it('renders a validation disabled <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} input={Object.assign(defaultProps.input, { disableValidation: true })} />);
    expect(wrapper.is('Input')).to.be.true;
    expect(wrapper.prop('errors')).to.be.null;
    expect(wrapper.prop('bsStyle')).to.be.null;
    expect(wrapper.prop('hasFeedback')).to.be.false;
  });

  it('renders a div around <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} divClassName="myclassName" />);
    expect(wrapper.is('div')).to.be.true;
    expect(wrapper.prop('className')).to.equal('myclassName');
    expect(wrapper.find('Input').length).to.equal(1);
  });
});
