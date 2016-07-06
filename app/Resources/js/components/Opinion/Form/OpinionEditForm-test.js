/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import OpinionEditForm from './OpinionEditForm';
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
    opinion: { appendices: [{ type: { title: 'Exposé des motifs' } }], title: 'titre', body: 'body' },
    onSubmitSuccess: () => {},
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
    expect(form.prop('fields')).to.eql([
      {
        divClassName: 'alert alert-warning edit-confirm-alert',
        id: 'opinion_check',
        label: 'check',
        name: 'check',
        type: 'checkbox',
      },
      {
        id: 'opinion_title',
        label: 'name',
        name: 'title',
        type: 'text',
      },
      {
        id: 'opinion_body',
        label: 'body',
        name: 'body',
        type: 'editor',
      },
      {
        id: 'opinion_appendix-1',
        name: 'Exposé des motifs',
        type: 'editor',
      },
    ]);
    expect(form.prop('initialValues')).to.eql({
      title: props.opinion.title,
      body: props.opinion.body,
    });
    expect(form.prop('onSubmitFail')).to.equal(props.onFailure);
    expect(form.prop('onSubmit')).to.be.defined;
  });
});
