/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import OpinionForm, { labels } from './OpinionForm';
import IntlData from '../../../translations/FR';

describe('<OpinionForm />', () => {
  const props = {
    store: {
      subscribe: () => {},
      dispatch: () => {},
      getState: () => {},
    },
    fields: [
      {
        name: 'title',
        label: 'title',
        id: '1',
      },
      {
        name: 'body',
        label: 'body',
        id: '2',
      },
    ],
    form: 'test-form',
    validate: () => {},
    onSubmit: () => {},
    ...IntlData,
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionForm {...props} />);
    expect(wrapper.is('ReduxForm')).to.be.true;
    const form = wrapper.find('ReduxForm').shallow().find('Connect').shallow();
    expect(form.is('Form')).to.be.true;
    expect(form.prop('form')).to.equal(props.form);
    expect(form.prop('fields')).to.equal(props.fields);
    expect(form.prop('onSubmit')).to.equal(props.onSubmit);
    expect(form.prop('translations')).to.equal(labels);
  });
});
