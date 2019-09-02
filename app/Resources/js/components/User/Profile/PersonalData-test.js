/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { PersonalData } from './PersonalData';
import { intlMock, formMock, $fragmentRefs, $refType } from '../../../mocks';

describe('<PersonalData />', () => {
  const viewer1 = {
    $refType,
    $fragmentRefs,
    id: 'user',
    email: 'viewer@oui.fr',
    isArchiveReady: true,
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
  };

  const props1 = {
    ...formMock,
    intl: intlMock,
    initialValues: {
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
    },
    currentValues: {
      firstname: 'Utilisateur',
      lastname: 'Super',
      dateOfBirth: '29-02-1990',
      phone: '0123456789',
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: 'MALE',
    },
  };
  const props2 = {
    ...formMock,
    intl: intlMock,
    initialValues: {
      firstname: 'Utilisateur',
      lastname: 'Super',
      dateOfBirth: '29-02-1990',
      phone: '0123456789',
      address: null,
      address2: null,
      zipCode: null,
      city: null,
      gender: 'MALE',
      phoneConfirmed: true,
    },
    currentValues: {
      firstname: 'Utilisateur',
      lastname: 'Super',
      dateOfBirth: '29-02-1990',
      phone: '0123456789',
      address: null,
      address2: null,
      zipCode: null,
      city: null,
      gender: 'MALE',
    },
  };

  const viewer2 = {
    $refType,
    $fragmentRefs,
    id: 'user',
    address: 'oui',
    address2: 'oui',
    city: 'oui',
    email: 'oui@oui.fr',
    zipCode: '94500',
    isArchiveReady: true,
    firstname: 'Utilisateur',
    lastname: 'Super',
    dateOfBirth: '29-02-1990',
    phone: '0123456789',
    gender: 'MALE',
    phoneConfirmed: true,
  };
  const props3 = {
    ...formMock,
    intl: intlMock,
    initialValues: {
      firstname: 'Utilisateur',
      lastname: null,
      dateOfBirth: null,
      phone: '0123456789',
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: null,
      phoneConfirmed: true,
    },
    currentValues: {
      firstname: 'Utilisateur',
      lastname: null,
      dateOfBirth: null,
      phone: '0123456789',
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: null,
    },
  };
  const viewer3 = {
    $refType,
    $fragmentRefs,
    id: 'user',
    dateOfBirth: null,
    email: 'oui@non.fr',
    gender: 'MALE',
    isArchiveReady: true,
    lastname: 'oui',
    phoneConfirmed: true,
    firstname: 'Utilisateur',
    phone: '0123456789',
    address: '12 rue des boulets',
    address2: '2ième etage',
    zipCode: '75012',
    city: 'Paris',
  };

  it('should render with full user', () => {
    const wrapper = shallow(<PersonalData {...props1} viewer={viewer1} />);
    wrapper.setState({
      showDeleteModal: false,
    });

    expect(wrapper).toMatchSnapshot();
  });
  it('should render user withou address', () => {
    const wrapper = shallow(<PersonalData {...props2} viewer={viewer2} />);
    wrapper.setState({
      showDeleteModal: false,
    });

    expect(wrapper).toMatchSnapshot();
  });
  it('should render user without lastname, dateOfBirth, gender but with address', () => {
    const wrapper = shallow(<PersonalData {...props3} viewer={viewer3} />);
    wrapper.setState({
      showDeleteModal: false,
    });

    expect(wrapper).toMatchSnapshot();
  });
});
