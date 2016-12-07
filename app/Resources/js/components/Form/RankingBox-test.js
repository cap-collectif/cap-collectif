/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import RankingBox from './RankingBox';
import RankingSpot from './RankingSpot';
import RankingItem from './RankingItem';

const props = {
  fieldId: 42,
  spotsNb: 3,
  moveItem: () => {},
  ...IntlData,
};

const item1 = { id: 1 };
const item2 = { id: 2 };

const itemsList = [
  item1,
  item2,
];

describe('<RankingBox />', () => {
  it('should render ranking pick box with correct props', () => {
    const wrapper = shallow(<RankingBox {...props} items={itemsList} listType="pickBox" />);
    expect(wrapper.find('.ranking__pick-box__choices')).toHaveLength(1);
    const spots = wrapper.find(RankingSpot);
    expect(spots).toHaveLength(3);
    expect(spots.first().prop('onDrop')).toBeDefined();
    const items = wrapper.find(RankingItem);
    expect(items).toHaveLength(2);
    expect(items.first().prop('item')).toEqual(item1);
    expect(items.first().prop('id')).toEqual('reply-42_choice-1');
    expect(items.first().prop('disabled')).toEqual(false);
    expect(items.first().prop('arrowFunctions')).toContain('right');
    expect(items.first().prop('arrowFunctions')).not.toContain('left');
    expect(items.first().prop('arrowFunctions')).not.toContain('up');
    expect(items.first().prop('arrowFunctions')).not.toContain('down');
    expect(items.last().prop('item')).toEqual(item2);
    expect(items.last().prop('id')).toEqual('reply-42_choice-2');
    expect(items.last().prop('disabled')).toEqual(false);
  });

  it('should render ranking choice box with correct props', () => {
    const wrapper = shallow(<RankingBox {...props} items={itemsList} listType="choiceBox" />);
    expect(wrapper.find('.ranking__choice-box__choices')).toHaveLength(1);
    const spots = wrapper.find(RankingSpot);
    expect(spots).toHaveLength(3);
    expect(spots.first().prop('onDrop')).toBeDefined();
    const items = wrapper.find(RankingItem);
    expect(items).toHaveLength(2);
    expect(items.first().prop('item')).toEqual(item1);
    expect(items.first().prop('id')).toEqual('reply-42_choice-1');
    expect(items.first().prop('disabled')).toEqual(false);
    expect(items.first().prop('arrowFunctions')).not.toContain('right');
    expect(items.first().prop('arrowFunctions')).toContain('left');
    expect(items.first().prop('arrowFunctions')).toContain('up');
    expect(items.first().prop('arrowFunctions')).toContain('down');
    expect(items.last().prop('item')).toEqual(item2);
    expect(items.last().prop('id')).toEqual('reply-42_choice-2');
    expect(items.last().prop('disabled')).toEqual(false);
  });

  it('should render ranking choice box with disabled items', () => {
    const wrapper = shallow(<RankingBox {...props} items={itemsList} disabled listType="choiceBox" />);
    expect(wrapper.find('.ranking__choice-box__choices')).toHaveLength(1);
    const spots = wrapper.find(RankingSpot);
    expect(spots).toHaveLength(3);
    expect(spots.first().prop('onDrop')).toBeDefined();
    const items = wrapper.find(RankingItem);
    expect(items).toHaveLength(2);
    expect(items.first().prop('item')).toEqual(item1);
    expect(items.first().prop('id')).toEqual('reply-42_choice-1');
    expect(items.first().prop('disabled')).toEqual(true);
    expect(items.last().prop('item')).toEqual(item2);
    expect(items.last().prop('id')).toEqual('reply-42_choice-2');
    expect(items.last().prop('disabled')).toEqual(true);
  });
});
