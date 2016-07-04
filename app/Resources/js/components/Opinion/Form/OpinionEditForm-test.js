/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { OpinionEditForm } from './OpinionEditForm';
import IntlData from '../../../translations/FR';

describe('<OpinionEditForm />', () => {
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
    onFailure: () => {},
    handleSubmit: () => {},
    validate: () => {},
    ...IntlData,
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionEditForm {...props} />);
    const form = wrapper.find('OpinionForm');
    expect(form.length).to.equal(1);
    expect(form.prop('form')).to.equal('opinion-edit-form');
    expect(form.prop('fields')).to.equal([]);
    expect(form.prop('initialValues')).to.equal({});
    expect(form.prop('onSubmitFail')).to.equal(props.onFailure);
    expect(form.prop('onSubmit')).to.be.a.function;
  });
});
