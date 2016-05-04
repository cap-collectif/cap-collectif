/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RankingArrow from './RankingArrow';

const onClick = () => {};

describe('<RankingArrow />', () => {
  it('should render a left disabled button when required', () => {
    const wrapper = shallow(<RankingArrow type="left" onClick={onClick} disabled />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    expect(button.prop('disabled')).to.equal(true);
    expect(button.prop('onClick')).to.equal(null);
    const icon = button.find('i');
    expect(icon.hasClass('cap')).to.equal(true);
    expect(icon.hasClass('cap-arrow-65')).to.equal(true);
  });

  it('should render a right enabled button when required', () => {
    const wrapper = shallow(<RankingArrow type="right" onClick={onClick} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    expect(button.prop('disabled')).to.equal(false);
    expect(button.prop('onClick')).to.equal(onClick);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-66')).to.equal(true);
  });

  it('should render an up button when required', () => {
    const wrapper = shallow(<RankingArrow type="up" onClick={onClick} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-68')).to.equal(true);
  });

  it('should render a down button when required', () => {
    const wrapper = shallow(<RankingArrow type="down" onClick={onClick} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-67')).to.equal(true);
  });
});
