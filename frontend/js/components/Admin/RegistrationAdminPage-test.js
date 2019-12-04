// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationAdminPage } from './RegistrationAdminPage';
import { features } from '../../redux/modules/default';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<RegistrationAdminPage />', () => {
  const props = {
    isSuperAdmin: true,
    features: {
      ...features,
    },
    onToggle: jest.fn(),
  };

  const defaultQuery = {
    $refType,
    $fragmentRefs,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationAdminPage query={defaultQuery} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when not super admin', () => {
    const wrapper = shallow(
      <RegistrationAdminPage query={defaultQuery} {...props} isSuperAdmin={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
