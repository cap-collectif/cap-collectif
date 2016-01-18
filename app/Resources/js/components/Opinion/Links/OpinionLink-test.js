/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import OpinionLink from './OpinionLink';

describe('<OpinionLink />', () => {
  const linkUserVip = {
    author: {
      vip: true,
    },
  };
  const linkUserNotVip = {
    author: {
      vip: false,
    },
  };

  it('should render a li bordered', () => {
    const wrapper = shallow(<OpinionLink link={linkUserVip} />);
    expect(wrapper.find('li.opinion.block--bordered')).to.have.length(1);
  });

  it('should render a colored li if author is vip', () => {
    const wrapper = shallow(<OpinionLink link={linkUserVip} />);
    expect(wrapper.find('li.bg-vip')).to.have.length(1);
  });

  it('should render a white li if not vip', () => {
    const wrapper = shallow(<OpinionLink link={linkUserNotVip} />);
    expect(wrapper.find('li.bg-vip')).to.not.exists;
  });
});
