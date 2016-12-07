/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import Input from './Input';
import Other from './Other';
import Checkbox from './Checkbox';
import CheckboxGroup from 'react-checkbox-group';

describe('<Checkbox />', () => {
  const field = {
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
  const emptyFunction = () => {};

  it('should render a CheckboxGroup component with right props', () => {
    const wrapper = shallow(<Checkbox
      field={field}
      id={`reply-${field.id}`}
      onChange={emptyFunction}
      getGroupStyle={emptyFunction}
      renderFormErrors={emptyFunction}
      disabled={false}
      {...IntlData}
    />);
    expect(wrapper.find(CheckboxGroup)).toHaveLength(1);
    expect(wrapper.find(CheckboxGroup).prop('name')).toEqual(`choices-for-field-${field.id}`);
    expect(wrapper.find(CheckboxGroup).prop('value')).to.be.a('array');
    expect(wrapper.find(CheckboxGroup).prop('onChange')).toBeDefined();
  });

  it('should render a CheckboxGroup component with 4 Input components inside', () => {
    const wrapper = shallow(<Checkbox
      field={field}
      id={`reply-${field.id}`}
      onChange={emptyFunction}
      getGroupStyle={emptyFunction}
      renderFormErrors={emptyFunction}
      disabled={false}
      {...IntlData}
    />);
    expect(wrapper.find(CheckboxGroup).find(Input)).toHaveLength(4);
    expect(wrapper.find(CheckboxGroup).find(Input).first().prop('id')).toEqual(`reply-11_choice-${field.choices[0].id}`);
    expect(wrapper.find(CheckboxGroup).find(Input).first().prop('name')).toEqual(`choices-for-field-${field.id}`);
    expect(wrapper.find(CheckboxGroup).find(Input).first().prop('type')).toEqual('checkbox');
    expect(wrapper.find(CheckboxGroup).find(Input).first().prop('label')).toEqual(field.choices[0].label);
    expect(wrapper.find(CheckboxGroup).find(Input).first().prop('value')).toEqual(field.choices[0].label);
  });

  it('should render a CheckboxGroup component with an Other component inside', () => {
    const wrapper = shallow(<Checkbox
      field={field}
      id={`reply-${field.id}`}
      onChange={emptyFunction}
      getGroupStyle={emptyFunction}
      renderFormErrors={emptyFunction}
      disabled={false}
      {...IntlData}
    />);
    expect(wrapper.find(CheckboxGroup).find(Other)).toHaveLength(1);
    expect(wrapper.find(CheckboxGroup).find(Other).prop('field')).toEqual(field);
    expect(wrapper.find(CheckboxGroup).find(Other).prop('onChange')).toBeDefined();
    expect(wrapper.find(CheckboxGroup).find(Other).prop('disabled')).to.be.a('boolean');
  });
});
