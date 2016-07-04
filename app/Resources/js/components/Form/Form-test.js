/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Form } from './Form';

describe('<Form />', () => {
  const props = {
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

  it('renders given fields', () => {
    const wrapper = shallow(<Form {...props} />);
    expect(wrapper.find('Field').length).to.equal(2);
  });

  it('focus the first field', () => {
    const wrapper = shallow(<Form {...props} />);
    expect(wrapper.find('Field').first().prop('autoFocus')).to.equal(true);
    expect(wrapper.find('Field').at(1).prop('autoFocus')).to.equal(false);
  });
});
