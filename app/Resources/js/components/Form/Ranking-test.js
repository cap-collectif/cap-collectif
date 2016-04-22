/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import Ranking from './Ranking';
import RankingBlock from './RankingBlock';

describe('<Ranking />', () => {
  const field = {
    id: 12,
    question: 'Question 1',
    helpText: 'Texte d\'aide',
    required: false,
    choices: [
      { id: 24, label: 'Maxime Arrouard' },
      { id: 25, label: 'Spylou Super Sayen' },
      { id: 26, label: 'Cyril Lage' },
      { id: 27, label: 'Superman' },
    ],
  };

  const props = {
    id: 'ranking',
    labelClassName: 'label-class',
    getGroupStyle: () => {return '';},
    renderFormErrors: () => {},
    onChange: () => {},
    ...IntlData,
  };

  it('should render a label with correct class name, a help text and a ranking block', () => {
    const wrapper = shallow(<Ranking {...props} field={field} />);
    expect(wrapper.find('#ranking.form-group')).to.have.length(1);
    const label = wrapper.find('label');
    expect(label).to.have.lengthOf(1);
    expect(label.hasClass('label-class')).to.equal(true);
    expect(label.text()).to.equal('Question 1 (facultatif)');
    const helpText = wrapper.find('span.help-block');
    expect(helpText).to.have.lengthOf(1);
    expect(helpText.text()).to.equal('Texte d\'aide');
    const ranking = wrapper.find(RankingBlock);
    expect(ranking).to.have.lengthOf(1);
    expect(ranking.prop('field')).to.equal(field);
    expect(ranking.prop('disabled')).to.equal(false);
    expect(ranking.prop('onRankingChange')).to.be.a('function');
  });
});
