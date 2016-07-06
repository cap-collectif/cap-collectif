/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    handleSubmit: () => {},
  };

  it('renders a <form /> element', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('form').is('#test-form')).to.be.true;
    expect(wrapper.find('form').prop('onSubmit')).to.equal(defaultProps.handleSubmit);
  });

  it('renders no submit button', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('button[type="submit"]').length).to.equal(0);
  });

  it('renders the correct form elements', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('Field').length).to.equal(2);
    expect(wrapper.find('[name="title"]').length).to.equal(1);
    expect(wrapper.find('[name="body"]').length).to.equal(1);
  });

  it('focus the first field', () => {
    const wrapper = shallow(<Form {...defaultProps} />);
    expect(wrapper.find('Field').at(0).prop('autoFocus')).to.equal(true);
    expect(wrapper.find('Field').at(1).prop('autoFocus')).to.equal(false);
  });
});
