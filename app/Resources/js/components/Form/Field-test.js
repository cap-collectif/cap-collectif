/* eslint-env jest */
import React from 'react';
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
    expect(wrapper.prop('type')).toEqual(defaultProps.type);
    expect(wrapper.prop('label')).toEqual(defaultProps.input.label);
    expect(wrapper.prop('id')).toEqual(defaultProps.id);
    expect(wrapper.prop('autoFocus')).toEqual(defaultProps.input.autoFocus);
    expect(wrapper.prop('labelClassName')).toEqual('');
    expect(wrapper.prop('placeholder')).toEqual(null);
  });

  it('renders a default <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} />);
    expect(wrapper.is('Input')).toEqual(true);
    expect(wrapper.prop('errors')).toEqual(null);
    expect(wrapper.prop('validationState')).toEqual(null);
    expect(wrapper.prop('hasFeedback')).toEqual(false);
  });

  it('renders a validated <Input /> element', () => {
    const wrapper = shallow(
      <Field {...defaultProps} meta={{ touched: true }} />,
    );
    expect(wrapper.is('Input')).toEqual(true);
    expect(wrapper.prop('errors')).toEqual(null);
    expect(wrapper.prop('validationState')).toEqual('success');
    expect(wrapper.prop('hasFeedback')).toEqual(true);
  });

  it('renders an errored <Input /> element', () => {
    const wrapper = shallow(
      <Field
        {...defaultProps}
        meta={{ touched: true, error: 'global.required' }}
      />,
    );
    expect(wrapper.is('Input')).toEqual(true);
    expect(wrapper.prop('errors')).toEqual('Cette valeur est requise.');
    expect(wrapper.prop('validationState')).toEqual('error');
    expect(wrapper.prop('hasFeedback')).toEqual(true);
  });

  it('renders a validation disabled <Input /> element', () => {
    const wrapper = shallow(
      <Field
        {...defaultProps}
        input={Object.assign(defaultProps.input, { disableValidation: true })}
      />,
    );
    expect(wrapper.is('Input')).toEqual(true);
    expect(wrapper.prop('errors')).toEqual(null);
    expect(wrapper.prop('validationState')).toEqual(null);
    expect(wrapper.prop('hasFeedback')).toEqual(false);
  });

  it('renders a div around <Input /> element', () => {
    const wrapper = shallow(
      <Field {...defaultProps} divClassName="myclassName" />,
    );
    expect(wrapper.is('div')).toEqual(true);
    expect(wrapper.prop('className')).toEqual('myclassName');
    expect(wrapper.find('Input').length).toEqual(1);
  });
});
