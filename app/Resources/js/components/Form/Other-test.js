/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import Input from './Input';
import Other from './Other';

describe('<Other />', () => {
  const checkboxField = {
    id: 11,
    type: 'checkbox',
    slug: 'pour-quel-type-d-epreuve-etes-vous-pret-a-acheter-des-places',
    question: 'Pour quel type d\'épreuve êtes vous prêt à acheter des places',
    helpText: 'Plusieurs choix sont possibles',
    required: false,
    isOtherAllowed: true,
    choices: [
      { id: 20, label: 'Athlétisme' },
      { id: 21, label: 'Natation' },
      { id: 22, label: 'Sports collectifs' },
      { id: 23, label: 'Sports individuels' },
    ],
  };
  const radioField = {
    id: 12,
    type: 'radio',
    slug: 'quel-est-ton-athlete-favori',
    question: 'Quel est ton athlète favori ?',
    helpText: 'Un seul choix possible',
    required: true,
    isOtherAllowed: true,
    choices: [
      { id: 24, label: 'Maxime Arrouard' },
      { id: 25, label: 'Spylou Super Sayen' },
      { id: 26, label: 'Cyril Lage' },
      { id: 27, label: 'Superman' },
    ],
  };
  const emptyFunction = () => {};

  it('should render 2 Input components (radio + text) with right props', () => {
    const wrapper = shallow(<Other
      field={radioField}
      onChange={emptyFunction}
      disabled={false}
      {...IntlData}
    />);
    const radioComponent = wrapper.findWhere(n => (n.type() === Input && n.prop('type') === 'radio'));
    expect(radioComponent).to.have.lengthOf(1);
    expect(radioComponent.prop('id')).to.equal(radioField.id + '-choice-other');
    expect(radioComponent.prop('name')).to.equal('choices-for-field-' + radioField.id);
    expect(radioComponent.prop('type')).to.equal('radio');
    expect(radioComponent.prop('checked')).to.be.a('boolean');
    expect(radioComponent.prop('disabled')).to.be.a('boolean');
    expect(radioComponent.prop('onChange')).to.be.a('function');

    const textComponent = wrapper.findWhere(n => (n.type() === Input && n.prop('type') === 'text'));
    expect(textComponent).to.have.lengthOf(1);
    expect(textComponent.prop('type')).to.equal('text');
    expect(textComponent.prop('bsSize')).to.equal('small');
    expect(textComponent.prop('placeholder')).to.be.a('string');
    expect(textComponent.prop('disabled')).to.be.a('boolean');
    expect(textComponent.prop('onChange')).to.be.a('function');
  });

  it('should render 2 Input components (checkbox + text) with right props', () => {
    const wrapper = shallow(<Other
      field={checkboxField}
      onChange={emptyFunction}
      disabled={false}
      {...IntlData}
    />);
    const checkboxComponent = wrapper.findWhere(n => (n.type() === Input && n.prop('type') === 'checkbox'));
    expect(checkboxComponent).to.have.lengthOf(1);
    expect(checkboxComponent.prop('id')).to.equal(checkboxField.id + '-choice-other');
    expect(checkboxComponent.prop('name')).to.equal('choices-for-field-' + checkboxField.id);
    expect(checkboxComponent.prop('type')).to.equal('checkbox');
    expect(checkboxComponent.prop('checked')).to.be.a('boolean');
    expect(checkboxComponent.prop('disabled')).to.be.a('boolean');
    expect(checkboxComponent.prop('onChange')).to.be.a('function');

    const textComponent = wrapper.findWhere(n => (n.type() === Input && n.prop('type') === 'text'));
    expect(textComponent).to.have.lengthOf(1);
    expect(textComponent.prop('type')).to.equal('text');
    expect(textComponent.prop('bsSize')).to.equal('small');
    expect(textComponent.prop('placeholder')).to.be.a('string');
    expect(textComponent.prop('disabled')).to.be.a('boolean');
    expect(textComponent.prop('onChange')).to.be.a('function');
  });
});
