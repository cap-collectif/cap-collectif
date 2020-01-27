// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import RankingBox from './RankingBox';
import RankingSpot from './RankingSpot';
import RankingItem from './RankingItem';

const props = {
  fieldId: 42,
  spotsNb: 3,
  moveItem: () => {},
};

const item1 = { id: 1 };
const item2 = { id: 2 };

const itemsList = [item1, item2];

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
    expect(items.first().prop('arrowFunctions').right).toBeDefined();
    expect(items.first().prop('arrowFunctions').left).not.toBeDefined();
    expect(items.first().prop('arrowFunctions').up).not.toBeDefined();
    expect(items.first().prop('arrowFunctions').down).not.toBeDefined();
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
    expect(items.first().prop('arrowFunctions').right).not.toBeDefined();
    expect(items.first().prop('arrowFunctions').left).toBeDefined();
    expect(items.first().prop('arrowFunctions').up).toBeDefined();
    expect(items.first().prop('arrowFunctions').down).toBeDefined();
    expect(items.last().prop('item')).toEqual(item2);
    expect(items.last().prop('id')).toEqual('reply-42_choice-2');
    expect(items.last().prop('disabled')).toEqual(false);
  });

  it('should render ranking choice box with disabled items', () => {
    const wrapper = shallow(
      <RankingBox {...props} items={itemsList} disabled listType="choiceBox" />,
    );
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
