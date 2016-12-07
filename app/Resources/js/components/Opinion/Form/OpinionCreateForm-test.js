/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import OpinionCreateForm from './OpinionCreateForm';
import { defaultValidation } from './OpinionForm';
import IntlData from '../../../translations/FR';


describe('<OpinionCreateForm />', () => {
  const props = {
    projectId: 1,
    stepId: 1,
    opinionType: { appendixTypes: [{
      type: 1,
      id: 1,
      title: 'appendice',
    }] },
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
    onSubmitSuccess: () => {},
    onFailure: () => {},
    handleSubmit: () => {},
    validate: () => {},
    ...IntlData,
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionCreateForm {...props} />);
    expect(wrapper.is('OpinionForm')).toEqual(true);
    expect(wrapper.prop('form')).toEqual('opinion-create-form');
    expect(wrapper.prop('validate')).toEqual(defaultValidation);
    expect(wrapper.prop('fields')).toEqual([
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
        id: 'appendix_1',
        label: 'appendice',
        name: 'appendice',
        type: 'editor',
      },
    ]);
    expect(wrapper.prop('initialValues')).to.be.undefined;
    expect(wrapper.prop('onSubmitFail')).toEqual(props.onFailure);
    expect(wrapper.prop('onSubmit')).to.be.defined;
  });
});
