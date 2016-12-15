/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RadioGroup from 'react-radio';
import IntlData from '../../translations/FR';
import Input from './Input';
import Other from './Other';
import Radio from './Radio';

describe('<Radio />', () => {
  const field = {
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

  it('should render a RadioGroup component with right props', () => {
    const emptyFunction = () => {};
    const wrapper = shallow(<Radio
      field={field}
      id={`reply-${field.id}`}
      onChange={emptyFunction}
      getGroupStyle={emptyFunction}
      renderFormErrors={emptyFunction}
      {...IntlData}
    />);
    expect(wrapper.find(RadioGroup)).toHaveLength(1);
    expect(wrapper.find(RadioGroup).prop('name')).toEqual(`choices-for-field-${field.id}`);
    expect(wrapper.find(RadioGroup).prop('onChange')).toBeDefined();
  });

  it('should render a RadioGroup component with 4 Input components inside', () => {
    const emptyFunction = () => {};
    const wrapper = shallow(<Radio
      field={field}
      id={`reply-${field.id}`}
      onChange={emptyFunction}
      getGroupStyle={emptyFunction}
      renderFormErrors={emptyFunction}
      {...IntlData}
    />);
    expect(wrapper.find(RadioGroup).find(Input)).toHaveLength(4);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('id')).toEqual(`reply-12_choice-${field.choices[0].id}`);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('name')).toEqual(`choices-for-field-${field.id}`);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('type')).toEqual('radio');
    expect(wrapper.find(RadioGroup).find(Input).first().prop('label')).toEqual(field.choices[0].label);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('value')).toEqual(field.choices[0].label);
  });

  it('should render a RadioGroup component with an Other component inside', () => {
    const emptyFunction = () => {};
    const wrapper = shallow(<Radio
      field={field}
      id={`reply-${field.id}`}
      onChange={emptyFunction}
      getGroupStyle={emptyFunction}
      renderFormErrors={emptyFunction}
      {...IntlData}
    />);
    expect(wrapper.find(RadioGroup).find(Other)).toHaveLength(1);
    expect(wrapper.find(RadioGroup).find(Other).prop('field')).toEqual(field);
    expect(wrapper.find(RadioGroup).find(Other).prop('onChange')).toBeDefined();
  });
});
