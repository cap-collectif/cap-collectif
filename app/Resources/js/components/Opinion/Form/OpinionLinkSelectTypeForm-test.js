/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import OpinionLinkSelectTypeForm from './OpinionLinkSelectTypeForm';
import IntlData from '../../../translations/FR';

describe('<OpinionLinkSelectTypeForm />', () => {
  const props = {
    store: {
      getState: () => {},
      subscribe: () => {},
      dispatch: () => {},
    },
    options: [{ id: 42, title: 'option-42' }, { id: 43, title: 'option-43' }],
    onChange: () => {},
    ...IntlData,
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionLinkSelectTypeForm {...props} />);
    const form = wrapper
        .find('Connect')
        .shallow()
        .find('Form')
        .shallow()
        .find('Connect')
        .shallow()
        .shallow();
    expect(form.is('form')).toEqual(true);
    const field = form.find('Field');
    expect(field.length).toEqual(1);
    expect(field.prop('autoFocus')).toEqual(true);
    expect(field.prop('label')).toEqual('Section');
    expect(field.prop('type')).toEqual('select');
    expect(field.prop('name')).toEqual('opinionType');
    expect(field.prop('disableValidation')).toEqual(true);
    expect(field.find('option').length).toEqual(3);
    expect(field.find('option').first().prop('disabled')).toEqual(true);
    expect(field.find('option').first().text()).toEqual('Choisir une valeur');
    expect(field.find('option').at(1).prop('value')).toEqual(42);
    expect(field.find('option').at(1).text()).toEqual('option-42');
  });
});
