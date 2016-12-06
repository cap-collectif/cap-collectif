/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import Input from './Input';
import Other from './Other';
import Radio from './Radio';
import RadioGroup from 'react-radio';

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
    expect(wrapper.find(RadioGroup)).to.have.lengthOf(1);
    expect(wrapper.find(RadioGroup).prop('name')).to.equal(`choices-for-field-${field.id}`);
    expect(wrapper.find(RadioGroup).prop('onChange')).to.be.a('function');
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
    expect(wrapper.find(RadioGroup).find(Input)).to.have.lengthOf(4);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('id')).to.equal(`reply-12_choice-${field.choices[0].id}`);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('name')).to.equal(`choices-for-field-${field.id}`);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('type')).to.equal('radio');
    expect(wrapper.find(RadioGroup).find(Input).first().prop('label')).to.equal(field.choices[0].label);
    expect(wrapper.find(RadioGroup).find(Input).first().prop('value')).to.equal(field.choices[0].label);
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
    expect(wrapper.find(RadioGroup).find(Other)).to.have.lengthOf(1);
    expect(wrapper.find(RadioGroup).find(Other).prop('field')).to.eql(field);
    expect(wrapper.find(RadioGroup).find(Other).prop('onChange')).to.be.a('function');
  });
});
