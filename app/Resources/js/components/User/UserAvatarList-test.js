// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserAvatarList } from './UserAvatarList';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<UserAvatarList />', () => {
  it('renders correctly', () => {
    const props = {
      max: 10,
      users: [{
        $refType,
        $fragmentRefs,
        id: '1',
        username: 'toto',
      }]
    };
    const wrapper = shallow(<UserAvatarList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly withou authors', () => {
    const props = {
      max: 10,
      users: []
    };
    const wrapper = shallow(<UserAvatarList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
