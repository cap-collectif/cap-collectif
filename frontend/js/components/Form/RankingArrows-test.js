// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RankingArrows from './RankingArrows';

const arrowFunctions = {
  right: jest.fn(),
  left: jest.fn(),
};

const arrowFunctionsEmpty = {
  right: () => {},
  left: () => {},
};

const item = {};

describe('<RankingArrows />', () => {
  it('should render a button group with required ranking arrows', () => {
    const wrapper = shallow(<RankingArrows item={item} arrowFunctions={arrowFunctions} />);
    const buttonGroup = wrapper.find('ButtonGroup');
    expect(buttonGroup).toHaveLength(1);
    expect(buttonGroup.hasClass('ranking__item__arrows')).toEqual(true);
    expect(buttonGroup.find('RankingArrow')).toHaveLength(2);
    const rightArrow = buttonGroup.find('RankingArrow').first();
    expect(rightArrow.prop('onClick')).toBeDefined();
    expect(rightArrow.prop('type')).toEqual('right');
    expect(rightArrow.prop('disabled')).toEqual(false);
    const leftArrow = buttonGroup.find('RankingArrow').last();
    expect(leftArrow.prop('onClick')).toBeDefined();
    expect(leftArrow.prop('type')).toEqual('left');
    expect(leftArrow.prop('disabled')).toEqual(false);
  });

  it('should render a button group with disabled ranking arrows when required', () => {
    const wrapper = shallow(<RankingArrows item={item} arrowFunctions={arrowFunctions} disabled />);
    const buttonGroup = wrapper.find('ButtonGroup');
    expect(buttonGroup).toHaveLength(1);
    expect(buttonGroup.hasClass('ranking__item__arrows')).toEqual(true);
    expect(buttonGroup.find('RankingArrow')).toHaveLength(2);
    const rightArrow = buttonGroup.find('RankingArrow').first();
    expect(rightArrow.prop('onClick')).toBeDefined();
    expect(rightArrow.prop('type')).toEqual('right');
    expect(rightArrow.prop('disabled')).toEqual(true);
    const leftArrow = buttonGroup.find('RankingArrow').last();
    expect(leftArrow.prop('onClick')).toBeDefined();
    expect(leftArrow.prop('type')).toEqual('left');
    expect(leftArrow.prop('disabled')).toEqual(true);
  });

  it('should render a button group with disabled ranking arrows when there is no functions associated', () => {
    const wrapper = shallow(<RankingArrows item={item} arrowFunctions={arrowFunctionsEmpty} />);
    expect(wrapper).toMatchSnapshot();
  });
});
