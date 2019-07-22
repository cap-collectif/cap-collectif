// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserAvatarListContainer } from './UserAvatarList';
import { $refType, $fragmentRefs } from '../../mocks';
import { features } from '../../redux/modules/default';

describe('<UserAvatarListContainer />', () => {
  it('renders correctly', () => {
    const props = {
      features,
      max: 10,
      users: [
        {
          $refType,
          $fragmentRefs,
          id: '1',
          username: 'toto',
        },
      ],
    };
    const wrapper = shallow(<UserAvatarListContainer {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without authors', () => {
    const props = {
      features,
      max: 10,
      users: [],
    };
    const wrapper = shallow(<UserAvatarListContainer {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
