/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import ReplyForm from './ReplyForm';
import Input from '../../Form/Input';
import Checkbox from '../../Form/Checkbox';
import Radio from '../../Form/Radio';
import Ranking from '../../Form/Ranking';

describe('<ReplyForm />', () => {
  const form = {
    description: 'Iste aut quasi voluptatibus totam. Repellat dolor ullam quibusdam tempore neque impedit aut.',
    fields: [
      {
        id: 10,
        type: 'text',
        slug: 'etes-vous-satisfait-que-la-ville-de-paris-soit-candidate-a-l-organisation-des-jo-de-2024',
        question: 'Êtes-vous satisfait que la ville de Paris soit candidate à l\'organisation des JO de 2024 ?',
        helpText: '',
        required: true,
      },
      {
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
      },
      {
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
      },
      {
        id: 13,
        type: 'select',
        slug: 'nelson-monfort-parle-t-il',
        question: 'Nelson Monfort parle-t-il:',
        helpText: 'Merci de répondre sincèrement',
        required: false,
        choices: [
          { id: 28, label: 'Pas assez fort (Mon sonotone est en panne)' },
          { id: 29, label: 'Assez fort (Mon sonotone est mal réglé)' },
          { id: 30, label: 'Trop fort (Mon sonotone est tout neuf)' },
        ],
      },
      {
        id: 14,
        type: 'ranking',
        slug: 'nelson-monfort-parle-t-il',
        question: 'Nelson Monfort parle-t-il:',
        helpText: 'Merci de répondre sincèrement',
        required: false,
        choices: [
          { id: 28, label: 'Pas assez fort (Mon sonotone est en panne)' },
          { id: 29, label: 'Assez fort (Mon sonotone est mal réglé)' },
          { id: 30, label: 'Trop fort (Mon sonotone est tout neuf)' },
        ],
      },
    ],
  };
  const isSubmitting = false;
  const handleSubmitSuccess = () => {};
  const handleFailure = () => {};

  it('should render a Input text component with right props', () => {
    const wrapper = shallow(<ReplyForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitFailure={handleFailure}
      onValidationFailure={handleFailure}
      {...IntlData}
    />);
    const component = wrapper.findWhere(n => (n.type() === Input && n.prop('type') === 'text'));
    expect(component).to.have.lengthOf(1);
    expect(component.prop('type')).to.equal(form.fields[0].type);
    expect(component.prop('label')).to.equal(form.fields[0].question);
    expect(component.prop('id')).to.equal(`reply-${form.fields[0].id}`);
    expect(component.prop('help')).to.be.empty;
  });

  it('should render a Checkbox component with right props', () => {
    const wrapper = shallow(<ReplyForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitFailure={handleFailure}
      onValidationFailure={handleFailure}
      disabled={false}
      {...IntlData}
    />);
    expect(wrapper.find(Checkbox)).to.have.lengthOf(1);
    expect(wrapper.find(Checkbox).prop('id')).to.equal(`reply-${form.fields[1].id}`);
    expect(wrapper.find(Checkbox).prop('field')).to.eql(form.fields[1]);
    expect(wrapper.find(Checkbox).prop('onChange')).to.be.a('function');
    expect(wrapper.find(Checkbox).prop('getGroupStyle')).to.be.a('function');
    expect(wrapper.find(Checkbox).prop('renderFormErrors')).to.be.a('function');
    expect(wrapper.find(Checkbox).prop('disabled')).to.be.a('boolean');
  });

  it('should render a Radio component with right props', () => {
    const wrapper = shallow(<ReplyForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitFailure={handleFailure}
      onValidationFailure={handleFailure}
      {...IntlData}
    />);
    expect(wrapper.find(Radio)).to.have.lengthOf(1);
    expect(wrapper.find(Radio).prop('id')).to.equal(`reply-${form.fields[2].id}`);
    expect(wrapper.find(Radio).prop('field')).to.eql(form.fields[2]);
    expect(wrapper.find(Checkbox).prop('onChange')).to.be.a('function');
    expect(wrapper.find(Checkbox).prop('getGroupStyle')).to.be.a('function');
    expect(wrapper.find(Checkbox).prop('renderFormErrors')).to.be.a('function');
  });

  it('should render a Input select component with right props', () => {
    const wrapper = shallow(<ReplyForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitFailure={handleFailure}
      onValidationFailure={handleFailure}
      {...IntlData}
    />);
    const component = wrapper.findWhere(n => (n.type() === Input && n.prop('type') === 'select'));
    expect(component).to.have.length(1);
    expect(component.prop('type')).to.equal(form.fields[3].type);
    expect(component.prop('label')).to.equal(`${form.fields[3].question} (facultatif)`);
    expect(component.prop('id')).to.equal(`reply-${form.fields[3].id}`);
    expect(component.prop('help')).to.be.equal(form.fields[3].helpText);
  });

  it('should render a Ranking component with right props', () => {
    const wrapper = shallow(<ReplyForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitFailure={handleFailure}
      onValidationFailure={handleFailure}
      {...IntlData}
    />);
    const component = wrapper.find('Ranking');
    expect(component).to.have.length(1);
    expect(component.prop('id')).to.equal(`reply-${form.fields[4].id}`);
    expect(component.prop('field')).to.be.equal(form.fields[4]);
    expect(component.prop('onChange')).to.be.a('function');
    expect(component.prop('labelClassName')).to.equal('h4');
  });

  it('should render disabled fields when form is disabled', () => {
    const wrapper = shallow(<ReplyForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmitSuccess={handleSubmitSuccess}
      onSubmitFailure={handleFailure}
      onValidationFailure={handleFailure}
      disabled
      {...IntlData}
    />);
    const disabledInputs = wrapper.findWhere(n => (n.type() === Input && n.prop('disabled') === true));
    expect(disabledInputs).to.have.length(2);
    const disabledCheckboxes = wrapper.findWhere(n => (n.type() === Checkbox && n.prop('disabled') === true));
    expect(disabledCheckboxes).to.have.length(1);
    const disabledRadios = wrapper.findWhere(n => (n.type() === Radio && n.prop('disabled') === true));
    expect(disabledRadios).to.have.length(1);
    const enabledFields = wrapper.findWhere(n => ((n.type() === Input || n.type === Checkbox || n.type === Radio) && n.prop('disabled') === false));
    expect(enabledFields).to.have.length(0);
    const disabledRanking = wrapper.findWhere(n => (n.type() === Ranking && n.prop('disabled') === true));
    expect(disabledRanking).to.have.length(1);
  });
});
