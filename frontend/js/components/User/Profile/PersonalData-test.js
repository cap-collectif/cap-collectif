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
    postalAddress: null,
    address: '12 rue des boulets',
    address2: '2ième etage',
    zipCode: '75012',
    city: 'Paris',
    gender: 'MALE',
    phoneConfirmed: true,
    birthPlace: 'Loguetown',
    isFranceConnectAccount: false,
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
      phoneConfirmed: true,
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
      phoneConfirmed: true,
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
    id: 'user',
    postalAddress: null,
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
    birthPlace: 'Paris',
    isFranceConnectAccount: false,
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
      phoneConfirmed: true,
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
    id: 'user',
    dateOfBirth: null,
    email: 'oui@non.fr',
    gender: 'MALE',
    isArchiveReady: true,
    lastname: 'oui',
    phoneConfirmed: true,
    firstname: 'Utilisateur',
    phone: '0123456789',
    postalAddress: null,
    address: '12 rue des boulets',
    address2: '2ième etage',
    zipCode: '75012',
    city: 'Paris',
    birthPlace: 'Paris',
    isFranceConnectAccount: false,
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
  it('should render with personal data not editable', () => {
    // https://stackoverflow.com/questions/54021037/how-to-mock-window-location-href-with-jest-vuejs
    // $FlowFixMe assign new URL(...) to window.location because property location is not writable
    delete window.location;
    const url = 'https://jeparticipe.laregioncitoyenne.fr/fr/profile/edit-profile#personal-data';
    // $FlowFixMe assign new URL(...) to window.location because property location is not writable
    window.location = new URL(url);
    expect(window.location.href).toEqual(url);
    expect(window.location.hostname).toEqual('jeparticipe.laregioncitoyenne.fr');
    const wrapper = shallow(<PersonalData {...props3} viewer={viewer3} />);
    wrapper.setState({
      showDeleteModal: false,
    });

    expect(wrapper).toMatchSnapshot();
  });
});
