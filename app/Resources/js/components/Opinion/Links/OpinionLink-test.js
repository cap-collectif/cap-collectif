// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
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

  it('should render a colored list-group-item if author is vip', () => {
    const wrapper = shallow(<OpinionLink link={linkUserVip} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a white list-group-item if not vip', () => {
    const wrapper = shallow(<OpinionLink link={linkUserNotVip} />);
    expect(wrapper).toMatchSnapshot();
  });
});
