/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.find('.ranking__pick-box__choices')).to.have.lengthOf(1);
    const spots = wrapper.find(RankingSpot);
    expect(spots).to.have.lengthOf(3);
    expect(spots.first().prop('onDrop')).to.be.a('function');
    const items = wrapper.find(RankingItem);
    expect(items).to.have.lengthOf(2);
    expect(items.first().prop('item')).to.equal(item1);
    expect(items.first().prop('id')).to.equal('reply-42_choice-1');
    expect(items.first().prop('disabled')).to.equal(false);
    expect(items.first().prop('arrowFunctions')).to.include.keys('right');
    expect(items.first().prop('arrowFunctions')).to.not.include.keys('left');
    expect(items.first().prop('arrowFunctions')).to.not.include.keys('up');
    expect(items.first().prop('arrowFunctions')).to.not.include.keys('down');
    expect(items.last().prop('item')).to.equal(item2);
    expect(items.last().prop('id')).to.equal('reply-42_choice-2');
    expect(items.last().prop('disabled')).to.equal(false);
  });

  it('should render ranking choice box with correct props', () => {
    const wrapper = shallow(<RankingBox {...props} items={itemsList} listType="choiceBox" />);
    expect(wrapper.find('.ranking__choice-box__choices')).to.have.lengthOf(1);
    const spots = wrapper.find(RankingSpot);
    expect(spots).to.have.lengthOf(3);
    expect(spots.first().prop('onDrop')).to.be.a('function');
    const items = wrapper.find(RankingItem);
    expect(items).to.have.lengthOf(2);
    expect(items.first().prop('item')).to.equal(item1);
    expect(items.first().prop('id')).to.equal('reply-42_choice-1');
    expect(items.first().prop('disabled')).to.equal(false);
    expect(items.first().prop('arrowFunctions')).to.not.include.keys('right');
    expect(items.first().prop('arrowFunctions')).to.include.keys('left');
    expect(items.first().prop('arrowFunctions')).to.include.keys('up');
    expect(items.first().prop('arrowFunctions')).to.include.keys('down');
    expect(items.last().prop('item')).to.equal(item2);
    expect(items.last().prop('id')).to.equal('reply-42_choice-2');
    expect(items.last().prop('disabled')).to.equal(false);
  });

  it('should render ranking choice box with disabled items', () => {
    const wrapper = shallow(<RankingBox {...props} items={itemsList} disabled listType="choiceBox" />);
    expect(wrapper.find('.ranking__choice-box__choices')).to.have.lengthOf(1);
    const spots = wrapper.find(RankingSpot);
    expect(spots).to.have.lengthOf(3);
    expect(spots.first().prop('onDrop')).to.be.a('function');
    const items = wrapper.find(RankingItem);
    expect(items).to.have.lengthOf(2);
    expect(items.first().prop('item')).to.equal(item1);
    expect(items.first().prop('id')).to.equal('reply-42_choice-1');
    expect(items.first().prop('disabled')).to.equal(true);
    expect(items.last().prop('item')).to.equal(item2);
    expect(items.last().prop('id')).to.equal('reply-42_choice-2');
    expect(items.last().prop('disabled')).to.equal(true);
  });
});
