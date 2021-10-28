/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { PersonalData } from './PersonalData';
import { intlMock, formMock, $fragmentRefs, $refType } from '../../../mocks';
import { mockUrl } from '~/testUtils';

describe('<PersonalData />', () => {
  const viewer1 = {
    $refType,
    $fragmentRefs,
    isArchiveReady: true,
    firstname: 'Utilisateur',
    lastname: 'Super',
    dateOfBirth: '29-02-1990',
    phone: '0123456789',
    postalAddress: null,
    address: '12 rue des boulets',
    address2: '2ième etage',
    zipCode: '75012',
    city: 'Paris',
    gender: 'MALE',
    birthPlace: 'Loguetown',
    isFranceConnectAccount: false,
    userIdentificationCode: 'ADD45B4H',
  };

  const props1 = {
    ...formMock,
    intl: intlMock,
    initialValues: {
      firstname: 'Utilisateur',
      lastname: 'Super',
      dateOfBirth: '29-02-1990',
      phone: '0123456789',
      postalAddress: null,
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: 'MALE',
      isFranceConnectAccount: false,
      birthPlace: 'Noxus',
    },
    currentValues: {
      firstname: 'Utilisateur',
      lastname: 'Super',
      dateOfBirth: '29-02-1990',
      phone: '0123456789',
      postalAddress: null,
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: 'MALE',
      birthPlace: 'Demacia',
      isFranceConnectAccount: false,
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
      postalAddress: null,
      address: null,
      address2: null,
      zipCode: null,
      city: null,
      gender: 'MALE',
      birthPlace: null,
      isFranceConnectAccount: false,
    },
    currentValues: {
      firstname: 'Utilisateur',
      lastname: 'Super',
      dateOfBirth: '29-02-1990',
      phone: '0123456789',
      postalAddress: null,
      address: null,
      address2: null,
      zipCode: null,
      city: null,
      gender: 'MALE',
      birthPlace: null,
      isFranceConnectAccount: false,
    },
  };

  const viewer2 = {
    $refType,
    $fragmentRefs,
    postalAddress: null,
    address: 'oui',
    address2: 'oui',
    city: 'oui',
    zipCode: '94500',
    isArchiveReady: true,
    firstname: 'Utilisateur',
    lastname: 'Super',
    dateOfBirth: '29-02-1990',
    phone: '0123456789',
    gender: 'MALE',
    birthPlace: 'Paris',
    isFranceConnectAccount: false,
    userIdentificationCode: 'ADD45B4H',
  };
  const props3 = {
    ...formMock,
    intl: intlMock,
    initialValues: {
      firstname: 'Utilisateur',
      lastname: null,
      dateOfBirth: null,
      phone: '0123456789',
      postalAddress: null,
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: null,
      birthPlace: 'Paris',
      isFranceConnectAccount: false,
    },
    currentValues: {
      firstname: 'Utilisateur',
      lastname: null,
      dateOfBirth: null,
      phone: '0123456789',
      postalAddress: null,
      address: '12 rue des boulets',
      address2: '2ième etage',
      zipCode: '75012',
      city: 'Paris',
      gender: null,
      birthPlace: 'Paris',
      isFranceConnectAccount: false,
    },
  };
  const viewer3 = {
    $refType,
    $fragmentRefs,
    dateOfBirth: null,
    gender: 'MALE',
    isArchiveReady: true,
    lastname: 'oui',
    firstname: 'Utilisateur',
    phone: '0123456789',
    postalAddress: null,
    address: '12 rue des boulets',
    address2: '2ième etage',
    zipCode: '75012',
    city: 'Paris',
    birthPlace: 'Paris',
    isFranceConnectAccount: false,
    userIdentificationCode: null,
  };

  afterEach(() => {
    mockUrl('http://localhost');
  });

  it('should render with full user', () => {
    const wrapper = shallow(<PersonalData {...props1} viewer={viewer1} />);
    wrapper.setState({
      showDeleteModal: false,
    });

    expect(wrapper).toMatchSnapshot();
  });
  it('should render user without address', () => {
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
  it('should render with personal data not editable', () => {
    mockUrl('https://jeparticipe.laregioncitoyenne.fr/fr/profile/edit-profile#personal-data');
    expect(window.location.hostname).toEqual('jeparticipe.laregioncitoyenne.fr');
    const wrapper = shallow(<PersonalData {...props3} viewer={viewer3} />);
    wrapper.setState({
      showDeleteModal: false,
    });

    expect(wrapper).toMatchSnapshot();
  });
});
