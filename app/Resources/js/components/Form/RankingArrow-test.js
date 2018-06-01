// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RankingArrow from './RankingArrow';

const onClick = () => {};

describe('<RankingArrow />', () => {
  it('should render a left disabled button when required', () => {
    const wrapper = shallow(<RankingArrow type="left" onClick={onClick} disabled />);
    const button = wrapper.find('Button');
    expect(button).toHaveLength(1);
    expect(button.prop('disabled')).toEqual(true);
    expect(button.prop('onClick')).toEqual(null);
    const icon = button.find('i');
    expect(icon.hasClass('cap')).toEqual(true);
    expect(icon.hasClass('cap-delete-1')).toEqual(true);
  });

  it('should render a right enabled button and a label when required', () => {
    const wrapper = shallow(<RankingArrow type="right" onClick={onClick} />);
    const button = wrapper.find('Button');
    expect(button).toHaveLength(1);
    expect(button.prop('disabled')).toEqual(false);
    expect(button.prop('onClick')).toEqual(onClick);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-2-1')).toEqual(true);
  });

  it('should render an up button when required', () => {
    const wrapper = shallow(<RankingArrow type="up" onClick={onClick} />);
    const button = wrapper.find('Button');
    expect(button).toHaveLength(1);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-68')).toEqual(true);
  });

  it('should render a down button when required', () => {
    const wrapper = shallow(<RankingArrow type="down" onClick={onClick} />);
    const button = wrapper.find('Button');
    expect(button).toHaveLength(1);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-67')).toEqual(true);
  });
});
