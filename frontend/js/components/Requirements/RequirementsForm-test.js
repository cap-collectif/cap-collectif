// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import UpdateRequirementMutation from '../../mutations/UpdateRequirementMutation';
import UpdateProfilePersonalDataMutation from '../../mutations/UpdateProfilePersonalDataMutation';
import { RequirementsForm, onChange, validate } from './RequirementsForm';
import { formMock, $refType } from '~/mocks';

jest.mock('../../mutations/UpdateRequirementMutation', () => ({
  __esModule: true, // this property makes it work
  default: {
    commit: jest.fn().mockResolvedValue(),
  },
  namedExport: jest.fn(),
}));
jest.mock('../../mutations/UpdateProfilePersonalDataMutation', () => ({
  __esModule: true, // this property makes it work
  default: {
    commit: jest.fn().mockResolvedValue(),
  },
  namedExport: jest.fn(),
}));

describe('<RequirementsForm />', () => {
  const step = {
    $refType,
    requirements: {
      edges: [
        {
          node: {
            __typename: 'PhoneRequirement',
            id: 'requirement1',
            viewerMeetsTheRequirement: true,
            viewerValue: '+628353289',
          },
        },
        {
          node: {
            __typename: 'DateOfBirthRequirement',
            id: 'requirement2',
            viewerMeetsTheRequirement: true,
            viewerDateOfBirth: '1992-04-09T23:21:06+0200',
          },
        },
        {
          node: {
            __typename: 'FirstnameRequirement',
            id: 'requirement3',
            viewerMeetsTheRequirement: true,
            viewerValue: 'Pierre',
          },
        },
        {
          node: {
            __typename: 'LastnameRequirement',
            id: 'requirement4',
            viewerMeetsTheRequirement: true,
            viewerValue: 'Kiroule',
          },
        },
        {
          node: {
            __typename: 'CheckboxRequirement',
            id: 'requirement5',
            viewerMeetsTheRequirement: false,
            label: 'Offrir mon âme à Voldemort',
          },
        },
        {
          node: {
            __typename: 'IdentificationCodeRequirement',
            id: 'requirement6',
            viewerMeetsTheRequirement: false,
            viewerValue: null,
          },
        },
      ],
    },
  };

  it('should render a vote widget for a simple vote without limit', () => {
    const wrapper = shallow(<RequirementsForm step={step} isAuthenticated {...formMock} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('doesnt call api when value is same', () => {
    jest.useFakeTimers();
    const previousValues = {
      requirement1: null,
      requirement2: null,
      requirement3: null,
      requirement4: null,
      requirement5: false,
      requirement6: false,
    };
    const props = { ...formMock, step, pristine: false, isAuthenticated: false };
    const dispatch = jest.fn();
    expect(onChange(previousValues, dispatch, props, previousValues)).toMatchSnapshot();
    jest.runAllTimers();
    expect(dispatch).not.toHaveBeenCalled();
    expect(UpdateRequirementMutation.commit).not.toHaveBeenCalled();
    expect(UpdateProfilePersonalDataMutation.commit).not.toHaveBeenCalled();
  });

  it('call api on every value changed', () => {
    jest.useFakeTimers();
    const previousValues = {
      requirement1: null,
      requirement2: null,
      requirement3: null,
      requirement4: null,
      requirement5: false,
      requirement6: false,
    };
    const values = {
      requirement1: '0606060606',
      requirement2: '1992-04-09T23:21:06+0200',
      requirement3: 'Aurélien',
      requirement4: 'David',
      requirement5: true,
      requirement6: 'GG2AZR54',
    };
    const props = {
      ...formMock,
      step,
      isAuthenticated: false,
      pristine: false,
    };
    const dispatch = jest.fn();
    expect(onChange(values, dispatch, props, previousValues)).toMatchSnapshot();
    jest.runAllTimers();

    expect(dispatch).toMatchSnapshot();
    // called for requirement5
    expect(UpdateRequirementMutation.commit).toMatchSnapshot();
    // called for requirement1 to 4
    expect(UpdateProfilePersonalDataMutation.commit).toMatchSnapshot();
  });

  it('validate correctly', () => {
    const props = { ...formMock, pristine: false, step, isAuthenticated: false };
    expect(
      validate({}, { ...props, step: { $refType, requirements: { edges: null } } }),
    ).toMatchSnapshot();

    const values = {
      requirement1: '+33606060606',
      requirement2: '1992-04-09T23:21:06+0200',
      requirement3: 'Aurélien',
      requirement4: 'David',
      requirement5: true,
      requirement6: 'GG2AZR54',
    };
    expect(validate(values, props)).toMatchSnapshot();

    const invalidValues = {
      requirement1: '+3360606060612345',
    };
    expect(validate(invalidValues, props)).toMatchSnapshot();

    const emptyValues = {
      requirement1: null,
      requirement2: null,
      requirement3: null,
      requirement4: null,
      requirement5: false,
      requirement6: null,
    };
    expect(validate(emptyValues, props)).toMatchSnapshot();
  });
});
