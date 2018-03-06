/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import OpinionLink from './OpinionLink';

describe('<OpinionLink />', () => {
  const linkUserVip = {
    author: {
      vip: true
    }
  };
  const linkUserNotVip = {
    author: {
      vip: false
    }
  };

  it('should render a li bordered', () => {
    const wrapper = shallow(<OpinionLink link={linkUserVip} />);
    expect(wrapper.find('li.opinion.block--bordered')).toHaveLength(1);
  });

  it('should render a colored li if author is vip', () => {
    const wrapper = shallow(<OpinionLink link={linkUserVip} />);
    expect(wrapper.find('li.bg-vip')).toHaveLength(1);
  });

  it('should render a white li if not vip', () => {
    const wrapper = shallow(<OpinionLink link={linkUserNotVip} />);
    expect(wrapper.find('li.bg-vip')).toHaveLength(0.0);
  });
});
