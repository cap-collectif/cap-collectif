// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UserBlockProfile } from './UserBlockProfile';
import { $refType } from '../../../mocks';

const props = {
  query: {
    $refType,
    user: {
      adminUrl: '/user/booba/edit',
      displayName: 'Booba',
      media: { url: '/booba.png' },
      isAdmin: true,
    },
  },
};

const projectAdminProps = {
  query: {
    ...props.query,
    user: {
      ...props.query.user,
      isAdmin: false,
    },
  },
};

describe('<UserBlockProfile />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<UserBlockProfile {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with isAdmin false', () => {
    const wrapper = shallow(<UserBlockProfile {...projectAdminProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
