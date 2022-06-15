// @flow
/* eslint-env jest */

import getInitialValues from './getInitialValues';

describe('getInitialValues', () => {
  it('Should return correct value for all requirements', () => {
    const requirements = [
      {
        __typename: 'FirstnameRequirement',
        id: 'UmVxdWlyZW1lbnQ6N2U3ODIxODEtZDlmMS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        viewerValue: 'Laurent',
      },
      {
        __typename: 'LastnameRequirement',
        id: 'UmVxdWlyZW1lbnQ6N2U3ODM5ZDQtZDlmMS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        viewerValue: 'Brunet',
      },
      {
        __typename: 'IdentificationCodeRequirement',
        id: 'UmVxdWlyZW1lbnQ6N2U3ODRkNzQtZDlmMS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerValue: null,
      },
      {
        __typename: 'PhoneVerifiedRequirement',
        id: 'UmVxdWlyZW1lbnQ6N2U3ODVlYWEtZDlmMS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
      },
      {
        __typename: 'PhoneRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliY2I3NDAtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        viewerValue: '+3300000000',
      },
      {
        __typename: 'DateOfBirthRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliY2UwODktZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerDateOfBirth: null,
      },
      {
        __typename: 'PostalAddressRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliZDJiYTItZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerAddress: null,
      },
      {
        __typename: 'CheckboxRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliZDgwMjEtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        label: 'Checkbox requirement',
      },
      {
        __typename: 'CheckboxRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTlZDgwMjTtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        label: 'Checkbox requirement',
      },
    ];
    const value = getInitialValues(requirements, false, true, { phone: '0766509155' });
    const expected = {
      FirstnameRequirement: 'Laurent',
      LastnameRequirement: 'Brunet',
      IdentificationCodeRequirement: '',
      PhoneVerifiedRequirement: {
        CountryCode: '+33',
        phoneNumber: '0766509155',
      },
      DateOfBirthRequirement: null,
      PostalAddressRequirement: null,
      CheckboxRequirement: [
        {
          viewerMeetsTheRequirement: true,
          label: 'Checkbox requirement',
          id: 'UmVxdWlyZW1lbnQ6NTliZDgwMjEtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        },
        {
          viewerMeetsTheRequirement: true,
          label: 'Checkbox requirement',
          id: 'UmVxdWlyZW1lbnQ6NTlZDgwMjTtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        }
      ],
    };
    expect(value).toEqual(expected);
  });
  it('Should return correct value for all requirements with FranceConnect', () => {
    const requirements = [
      {
        __typename: 'PhoneVerifiedRequirement',
        id: 'UmVxdWlyZW1lbnQ6MDYzNWM0MjktZDlmMy0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
      },
      {
        __typename: 'FranceConnectRequirement',
        id: 'UmVxdWlyZW1lbnQ6MDYzNWUwYzktZDlmMy0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerValue: null,
      },
      {
        __typename: 'IdentificationCodeRequirement',
        id: 'UmVxdWlyZW1lbnQ6N2U3ODRkNzQtZDlmMS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerValue: null,
      },
      {
        __typename: 'PhoneRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliY2I3NDAtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        viewerValue: '+3300000000',
      },
      {
        __typename: 'DateOfBirthRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliY2UwODktZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerDateOfBirth: null,
      },
      {
        __typename: 'PostalAddressRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliZDJiYTItZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
        viewerAddress: null,
      },
      {
        __typename: 'CheckboxRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliZDgwMjEtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        label: 'Checkbox requirement',
      },
    ];
    const value = getInitialValues(requirements, false, true, { phone: '0766509155' });
    const expected = {
      FranceConnectRequirement: null,
      IdentificationCodeRequirement: '',
      PhoneVerifiedRequirement: { CountryCode: '+33', phoneNumber: '0766509155' },
      DateOfBirthRequirement: null,
      PostalAddressRequirement: null,
      CheckboxRequirement: [{
        viewerMeetsTheRequirement: true,
        label: 'Checkbox requirement',
        id: 'UmVxdWlyZW1lbnQ6NTliZDgwMjEtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
      }],
    };
    expect(value).toEqual(expected);
  });
  it('Should handle Phone Verification only', () => {
    const requirements = [
      {
        __typename: 'PhoneVerifiedRequirement',
        id: 'UmVxdWlyZW1lbnQ6N2U3ODVlYWEtZDlmMS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: false,
      },
      {
        __typename: 'PhoneRequirement',
        id: 'UmVxdWlyZW1lbnQ6NTliY2I3NDAtZDllZS0xMWVjLWI4NDAtMDI0MmFjMTMwMDA2',
        viewerMeetsTheRequirement: true,
        viewerValue: '+3300000000',
      },
    ];
    const value = getInitialValues(requirements, true, true, { phone: '0766509155' });
    const expected = {
      PhoneVerifiedRequirement: {
        CountryCode: '+33',
        phoneNumber: '0766509155',
      },
    };
    expect(value).toEqual(expected);
  });
  it('Should return empty ', () => {
    const requirements = [];
    const value = getInitialValues(requirements, false, false, { phone: '0766509155' });
    const expected = {};
    expect(value).toEqual(expected);
  });
});
