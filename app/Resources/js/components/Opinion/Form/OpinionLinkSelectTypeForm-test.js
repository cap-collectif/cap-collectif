/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    const form = wrapper.find('Connect').shallow().find('Form').shallow().find('Connect').shallow().shallow();
    expect(form.is('form')).to.be.true;
    const field = form.find('Field');
    expect(field.length).to.equal(1);
    expect(field.prop('autoFocus')).to.be.true;
    expect(field.prop('label')).to.equal('Type');
    expect(field.prop('type')).to.equal('select');
    expect(field.prop('name')).to.equal('opinionType');
    expect(field.prop('disableValidation')).to.be.true;
    expect(field.find('option').length).to.equal(3);
    expect(field.find('option').first().prop('disabled')).to.be.true;
    expect(field.find('option').first().text()).to.equal('Choisir une valeur');
    expect(field.find('option').at(1).prop('value')).to.equal(42);
    expect(field.find('option').at(1).text()).to.equal('option-42');
  });
});
