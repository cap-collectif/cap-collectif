/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import OpinionLinkCreateForm from './OpinionLinkCreateForm';
import IntlData from '../../../translations/FR';

describe('<OpinionLinkCreateForm />', () => {
  const props = {
    store: {
      subscribe: () => {},
      dispatch: () => {},
      getState: () => {},
    },
    availableTypes: [
      { id: '1337', appendixTypes: [{ id: '1', title: 'appendix-1' }] },
    ],
    opinion: {},
    onSubmitSuccess: () => {},
    onFailure: () => {},
    ...IntlData,
  };

  it('renders 2 forms', () => {
    const wrapper = shallow(<OpinionLinkCreateForm {...props} />);
    const form1 = wrapper.find('ReduxForm');
    expect(form1.prop('options')).toEqual(props.availableTypes);
    expect(form1.prop('initialValues')).toEqual({ opinionType: '1337' });
    const form2 = wrapper.find('OpinionForm');
    expect(form2.prop('form')).toEqual('opinion-link-create-form');
    expect(form2.prop('onSubmit')).toBeDefined();
    expect(form2.prop('onSubmitFail')).toEqual(props.onFailure);
    expect(form2.prop('fields')).toEqual([
      { label: 'title', name: 'title', type: 'text', id: 'opinion_title' },
      { label: 'body', name: 'body', type: 'editor', id: 'opinion_body' },
      {
        id: 'opinion_appendix-1',
        label: 'appendix-1',
        name: 'appendix-1',
        type: 'editor',
      },
    ]);
  });
});
