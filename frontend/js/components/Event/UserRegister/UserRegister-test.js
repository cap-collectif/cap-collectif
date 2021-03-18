/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UserRegister } from './UserRegister';
import { $refType, $fragmentRefs, intlMock } from '~/mocks';

const event = {
  $refType,
  id: '123454321',
};

const user = {
  $fragmentRefs,
  $refType,
  username: 'Username test',
};

describe('<UserRegister />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<UserRegister event={event} user={user} intl={intlMock} />);
    expect(wrapper).toMatchSnapshot();
  });
});
