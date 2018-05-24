/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { DeleteAccountModal } from './DeleteAccountModal';

describe('<DeleteAccountModal />', () => {
  const viewer = {
    id: 'user',
    firstname: 'Utilisateur',
    lastname: 'Super',
    dateOfBirth: '29-02-1990',
    phone: '0123456789',
    address: '12 rue des boulets',
    address2: '2ième etage',
    zipCode: '75012',
    city: 'Paris',
    gender: 'MALE',
    phoneConfirmed: true,
    contributionsCount: 20,
    votesCount: 10,
    contributionsToDeleteCount: 5,
  };

  it('should render an visible modal', () => {
    const wrapper = shallow(<DeleteAccountModal show viewer={viewer} dispatch={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render an hidden modal', () => {
    const wrapper = shallow(
      <DeleteAccountModal show={false} viewer={viewer} dispatch={() => {}} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
