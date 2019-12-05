// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserBlockProfile } from './UserBlockProfile';
import { $refType } from '../../../mocks';

describe('<UserBlockProfile />', () => {
  it('renders correctly', () => {
    const props = {
      query: {
        $refType,
        user: { adminUrl: '/user/booba/edit', displayName: 'Booba', media: { url: '/booba.png' } },
      },
    };
    const wrapper = shallow(<UserBlockProfile {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
