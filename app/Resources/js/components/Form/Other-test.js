// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import Input from './Input';
import Other from './Other';

describe('<Other />', () => {
  const checkboxField = {
    id: 11,
    type: 'checkbox',
    slug: 'pour-quel-type-d-epreuve-etes-vous-pret-a-acheter-des-places',
    question: "Pour quel type d'épreuve êtes vous prêt à acheter des places",
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
    const wrapper = shallow(<Other field={radioField} onChange={emptyFunction} disabled={false} />);
    const radioComponent = wrapper.findWhere(n => n.type() === Input && n.prop('type') === 'radio');
    expect(radioComponent).toHaveLength(1);
    expect(radioComponent.prop('id')).toEqual(`reply-${radioField.id}_choice-other--check`);
    expect(radioComponent.prop('name')).toEqual(`choices-for-field-${radioField.id}`);
    expect(radioComponent.prop('type')).toEqual('radio');
    expect(radioComponent.prop('checked')).toBeDefined();
    expect(radioComponent.prop('disabled')).toBeDefined();
    expect(radioComponent.prop('onChange')).toBeDefined();

    const textComponent = wrapper.findWhere(n => n.type() === Input && n.prop('type') === 'text');
    expect(textComponent).toHaveLength(1);
    expect(textComponent.prop('id')).toEqual(`reply-${radioField.id}_choice-other--field`);
    expect(textComponent.prop('type')).toEqual('text');
    expect(textComponent.prop('placeholder')).toBeDefined();
    expect(textComponent.prop('disabled')).toBeDefined();
    expect(textComponent.prop('onChange')).toBeDefined();
  });

  it('should render 2 Input components (checkbox + text) with right props', () => {
    const wrapper = shallow(
      <Other field={checkboxField} onChange={emptyFunction} disabled={false} />,
    );
    const checkboxComponent = wrapper.findWhere(
      n => n.type() === Input && n.prop('type') === 'checkbox',
    );
    expect(checkboxComponent).toHaveLength(1);
    expect(checkboxComponent.prop('id')).toEqual(`reply-${checkboxField.id}_choice-other--check`);
    expect(checkboxComponent.prop('name')).toEqual(`choices-for-field-${checkboxField.id}`);
    expect(checkboxComponent.prop('type')).toEqual('checkbox');
    expect(checkboxComponent.prop('checked')).toBeDefined();
    expect(checkboxComponent.prop('disabled')).toBeDefined();
    expect(checkboxComponent.prop('onChange')).toBeDefined();

    const textComponent = wrapper.findWhere(n => n.type() === Input && n.prop('type') === 'text');
    expect(textComponent).toHaveLength(1);
    expect(textComponent.prop('id')).toEqual(`reply-${checkboxField.id}_choice-other--field`);
    expect(textComponent.prop('type')).toEqual('text');
    expect(textComponent.prop('placeholder')).toBeDefined();
    expect(textComponent.prop('disabled')).toBeDefined();
    expect(textComponent.prop('onChange')).toBeDefined();
  });
});
