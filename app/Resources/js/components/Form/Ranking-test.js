/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

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
    getGroupStyle: () => { return ''; },
    renderFormErrors: () => {},
    onChange: () => {},
    ...IntlData,
  };

  it('should render a label with correct class name, a help text and a ranking block', () => {
    const wrapper = shallow(<Ranking {...props} field={field} />);
    expect(wrapper.find('#ranking.form-group')).toHaveLength(1);
    const label = wrapper.find('label');
    expect(label).toHaveLength(1);
    expect(label.hasClass('label-class')).toEqual(true);
    expect(label.text()).toEqual('Question 1 (facultatif)');
    const helpText = wrapper.find('span.help-block');
    expect(helpText).toHaveLength(1);
    expect(helpText.text()).toEqual('Texte d\'aide');
    const ranking = wrapper.find(RankingBlock);
    expect(ranking).toHaveLength(1);
    expect(ranking.prop('field')).toEqual(field);
    expect(ranking.prop('disabled')).toEqual(false);
    expect(ranking.prop('onRankingChange')).toBeDefined();
  });
});
