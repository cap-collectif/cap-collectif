/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import RankingBlock from './RankingBlock';
import RankingBox from './RankingBox';

const field = {
  id: 42,
  choices: [{}, {}, {}],
};

const props = {
  connectDropTarget: c => c,
  onRankingChange: () => {},
  field,
  ...IntlData,
};

const state = {
  items: {
    pickBox: [{}, {}],
    choiceBox: [{}],
  },
};

const OriginalComponent = RankingBlock.DecoratedComponent;

describe('<RankingBlock />', () => {
  it('should render two ranking boxes with correct props', () => {
    const wrapper = shallow(<OriginalComponent {...props} />);
    wrapper.setState(state);
    expect(wrapper.children()).toHaveLength(1);
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Col')).toHaveLength(2);
    const firstCol = wrapper.find('Col').first();
    expect(firstCol.prop('xs')).toEqual(6);
    expect(firstCol.find('h5').text()).toEqual('Choix disponibles');
    const firstList = firstCol.find('ListGroup');
    expect(firstList.hasClass('ranking__pick-box')).toEqual(true);
    const firstBox = firstList.find(RankingBox);
    expect(firstBox).toHaveLength(1);
    expect(firstBox.prop('items')).toEqual(state.items.pickBox);
    expect(firstBox.prop('spotsNb')).toEqual(3);
    expect(firstBox.prop('listType')).toEqual('pickBox');
    expect(firstBox.prop('fieldId')).toEqual(42);
    expect(firstBox.prop('moveItem')).toBeDefined();
    expect(firstBox.prop('disabled')).toEqual(false);
    const lastCol = wrapper.find('Col').last();
    expect(lastCol.last().prop('xs')).toEqual(6);
    expect(lastCol.find('h5').text()).toEqual('Votre classement');
    const lastList = lastCol.find('ListGroup');
    expect(lastList.hasClass('ranking__choice-box')).toEqual(true);
    const lastBox = lastList.find(RankingBox);
    expect(lastBox).toHaveLength(1);
    expect(lastBox.prop('items')).toEqual(state.items.choiceBox);
    expect(lastBox.prop('spotsNb')).toEqual(3);
    expect(lastBox.prop('listType')).toEqual('choiceBox');
    expect(lastBox.prop('fieldId')).toEqual(42);
    expect(lastBox.prop('moveItem')).toBeDefined();
    expect(lastBox.prop('disabled')).toEqual(false);
  });
});
