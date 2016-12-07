/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

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
    expect(wrapper.is('ReduxForm')).toEqual(true);
    const form = wrapper.find('ReduxForm').shallow().find('Connect').shallow();
    expect(form.is('Form')).toEqual(true);
    expect(form.prop('form')).toEqual(props.form);
    expect(form.prop('fields')).toEqual(props.fields);
    expect(form.prop('onSubmit')).toEqual(props.onSubmit);
    expect(form.prop('translations')).toEqual(labels);
  });
});
