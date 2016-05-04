/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import RankingArrow from './RankingArrow';
import IntlData from '../../translations/FR';

const onClick = () => {};

describe('<RankingArrow />', () => {
  it('should render a left disabled button when required', () => {
    const wrapper = shallow(<RankingArrow type="left" onClick={onClick} disabled {...IntlData} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    expect(button.prop('disabled')).to.equal(true);
    expect(button.prop('onClick')).to.equal(null);
    const icon = button.find('i');
    expect(icon.hasClass('cap')).to.equal(true);
    expect(icon.hasClass('cap-delete-1')).to.equal(true);
  });

  it('should render a right enabled button and a label when required', () => {
    const wrapper = shallow(<RankingArrow type="right" onClick={onClick} {...IntlData} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    expect(button.prop('disabled')).to.equal(false);
    expect(button.prop('onClick')).to.equal(onClick);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-2-1')).to.equal(true);
  });

  it('should render an up button when required', () => {
    const wrapper = shallow(<RankingArrow type="up" onClick={onClick} {...IntlData} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-68')).to.equal(true);
  });

  it('should render a down button when required', () => {
    const wrapper = shallow(<RankingArrow type="down" onClick={onClick} {...IntlData} />);
    const button = wrapper.find('Button');
    expect(button).to.have.lengthOf(1);
    const icon = button.find('i');
    expect(icon.hasClass('cap-arrow-67')).to.equal(true);
  });
});
