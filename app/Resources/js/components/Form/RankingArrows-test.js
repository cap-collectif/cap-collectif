/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RankingArrows from './RankingArrows';

const arrowFunctions = {
  right: () => {},
  left: () => {},
};

const arrowFunctionsEmpty = {
  right: null,
  left: null,
};

const item = {};

describe('<RankingArrows />', () => {
  it('should render a button group with required ranking arrows', () => {
    const wrapper = shallow(<RankingArrows item={item} arrowFunctions={arrowFunctions} />);
    const buttonGroup = wrapper.find('ButtonGroup');
    expect(buttonGroup).to.have.lengthOf(1);
    expect(buttonGroup.hasClass('ranking__item__arrows')).to.equal(true);
    expect(buttonGroup.find('RankingArrow')).to.have.lengthOf(2);
    const rightArrow = buttonGroup.find('RankingArrow').first();
    expect(rightArrow.prop('onClick')).to.be.a('function');
    expect(rightArrow.prop('type')).to.equal('right');
    expect(rightArrow.prop('disabled')).to.equal(false);
    const leftArrow = buttonGroup.find('RankingArrow').last();
    expect(leftArrow.prop('onClick')).to.be.a('function');
    expect(leftArrow.prop('type')).to.equal('left');
    expect(leftArrow.prop('disabled')).to.equal(false);
  });

  it('should render a button group with disabled ranking arrows when required', () => {
    const wrapper = shallow(<RankingArrows item={item} arrowFunctions={arrowFunctions} disabled />);
    const buttonGroup = wrapper.find('ButtonGroup');
    expect(buttonGroup).to.have.lengthOf(1);
    expect(buttonGroup.hasClass('ranking__item__arrows')).to.equal(true);
    expect(buttonGroup.find('RankingArrow')).to.have.lengthOf(2);
    const rightArrow = buttonGroup.find('RankingArrow').first();
    expect(rightArrow.prop('onClick')).to.be.a('function');
    expect(rightArrow.prop('type')).to.equal('right');
    expect(rightArrow.prop('disabled')).to.equal(true);
    const leftArrow = buttonGroup.find('RankingArrow').last();
    expect(leftArrow.prop('onClick')).to.be.a('function');
    expect(leftArrow.prop('type')).to.equal('left');
    expect(leftArrow.prop('disabled')).to.equal(true);
  });

  it('should render a button group with disabled ranking arrows when there is no functions associated', () => {
    const wrapper = shallow(<RankingArrows item={item} arrowFunctions={arrowFunctionsEmpty} />);
    const buttonGroup = wrapper.find('ButtonGroup');
    expect(buttonGroup).to.have.lengthOf(1);
    expect(buttonGroup.hasClass('ranking__item__arrows')).to.equal(true);
    expect(buttonGroup.find('RankingArrow')).to.have.lengthOf(2);
    const rightArrow = buttonGroup.find('RankingArrow').first();
    expect(rightArrow.prop('onClick')).to.equal(null);
    expect(rightArrow.prop('type')).to.equal('right');
    expect(rightArrow.prop('disabled')).to.equal(true);
    const leftArrow = buttonGroup.find('RankingArrow').last();
    expect(leftArrow.prop('onClick')).to.equal(null);
    expect(leftArrow.prop('type')).to.equal('left');
    expect(leftArrow.prop('disabled')).to.equal(true);
  });
});
