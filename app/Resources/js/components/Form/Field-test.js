// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Field from './Field';

describe('<Field />', () => {
  const defaultProps = {
    id: 'id',
    type: 'text',
    input: {
      autoFocus: false,
      name: 'name',
      label: 'label',
      disableValidation: false,
    },
    meta: {
      touched: false,
      dirty: false,
    },
  };

  it('pass input props to children', () => {
    const wrapper = shallow(<Field {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a default <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a validated <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} meta={{ touched: true }} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders an error <Input /> element', () => {
    const wrapper = shallow(
      <Field {...defaultProps} meta={{ touched: true, error: 'global.required' }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a validation disabled <Input /> element', () => {
    const wrapper = shallow(
      <Field
        {...defaultProps}
        input={Object.assign(defaultProps.input, { disableValidation: true })}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a div around <Input /> element', () => {
    const wrapper = shallow(<Field {...defaultProps} divClassName="myclassName" />);
    expect(wrapper).toMatchSnapshot();
  });
});
