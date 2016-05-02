/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
  field: field,
  ...IntlData,
};

const state = {
  items: {
    pickBox: [{}, {}],
    choiceBox: [{}],
  },
};

const OriginalComponent = RankingBlock.DecoratedComponent.DecoratedComponent;

describe('<RankingBlock />', () => {
  it('should render two ranking boxes with correct props', () => {
    const wrapper = shallow(<OriginalComponent {...props} />);
    wrapper.setState(state);
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.find('Row')).to.have.lengthOf(1);
    expect(wrapper.find('Col')).to.have.lengthOf(2);
    const firstCol = wrapper.find('Col').first();
    expect(firstCol.prop('xs')).to.equal(6);
    expect(firstCol.find('h5').text()).to.equal('Choix disponibles');
    const firstList = firstCol.find('ListGroup');
    expect(firstList.hasClass('ranking__pick-box')).to.equal(true);
    const firstBox = firstList.find(RankingBox);
    expect(firstBox).to.have.lengthOf(1);
    expect(firstBox.prop('items')).to.equal(state.items.pickBox);
    expect(firstBox.prop('spotsNb')).to.equal(3);
    expect(firstBox.prop('listType')).to.equal('pickBox');
    expect(firstBox.prop('fieldId')).to.equal(42);
    expect(firstBox.prop('moveItem')).to.be.a('function');
    expect(firstBox.prop('disabled')).to.equal(false);
    const lastCol = wrapper.find('Col').last();
    expect(lastCol.last().prop('xs')).to.equal(6);
    expect(lastCol.find('h5').text()).to.equal('Votre classement');
    const lastList = lastCol.find('ListGroup');
    expect(lastList.hasClass('ranking__choice-box')).to.equal(true);
    const lastBox = lastList.find(RankingBox);
    expect(lastBox).to.have.lengthOf(1);
    expect(lastBox.prop('items')).to.equal(state.items.choiceBox);
    expect(lastBox.prop('spotsNb')).to.equal(3);
    expect(lastBox.prop('listType')).to.equal('choiceBox');
    expect(lastBox.prop('fieldId')).to.equal(42);
    expect(lastBox.prop('moveItem')).to.be.a('function');
    expect(lastBox.prop('disabled')).to.equal(false);
  });
});
