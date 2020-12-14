/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { NewUserAvatar } from './NewUserAvatar';
import { $refType } from '~/mocks';

const baseProps = {
  user: {
    $refType,
    username: 'Pablo Escobar',
    media: {
      url: 'https://monAvatarWow.com',
    },
  },
};

const props = {
  basic: baseProps,
  noAvatar: {
    ...baseProps,
    user: {
      ...baseProps.user,
      media: null,
    },
  },
};

describe('<NewUserAvatar />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<NewUserAvatar {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no avatar', () => {
    const wrapper = shallow(<NewUserAvatar {...props.noAvatar} />);
    expect(wrapper).toMatchSnapshot();
  });
});
