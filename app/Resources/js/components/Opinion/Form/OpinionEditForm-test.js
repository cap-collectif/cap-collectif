/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

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
    expect(form.length).toEqual(1);
    expect(form.prop('form')).toEqual('opinion-edit-form');
    expect(form.prop('fields')).toEqual([
      {
        divClassName: 'alert alert-warning edit-confirm-alert',
        id: 'opinion_check',
        label: 'check',
        name: 'check',
        type: 'checkbox',
      },
      {
        id: 'opinion_title',
        label: 'title',
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
        label: 'Exposé des motifs',
        name: 'Exposé des motifs',
        type: 'editor',
      },
    ]);
    expect(form.prop('initialValues')).toEqual({
      title: props.opinion.title,
      body: props.opinion.body,
    });
    expect(form.prop('onSubmitFail')).toEqual(props.onFailure);
    expect(form.prop('onSubmit')).toBeDefined();;
  });
});
