/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import { Form } from './Form';

describe('<Form />', () => {
  const defaultProps = {
    fields: [
      {
        name: 'title',
        label: 'title',
      },
      {
        name: 'body',
        label: 'body',
      },
    ],
    form: 'test-form',
    onSubmit: () => {},
  };

  it('renders a <form /> element', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('form').is('#test-form')).toEqual(true);
    expect(wrapper.find('form').prop('onSubmit')).toEqual(defaultProps.onSubmit);
  });

  it('renders no submit button', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('button[type="submit"]').length).toEqual(0);
  });

  it('renders the correct form elements', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('Field').length).toEqual(2);
    expect(wrapper.find('[name="title"]').length).toEqual(1);
    expect(wrapper.find('[name="body"]').length).toEqual(1);
  });

  it('focus the first field', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('Field').at(0).prop('autoFocus')).toEqual(true);
    expect(wrapper.find('Field').at(1).prop('autoFocus')).toEqual(false);
  });
});
