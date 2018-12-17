// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RequirementsForm } from './RequirementsForm';
import { $refType, formMock } from '../../mocks';

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
            __typename: 'CheckboxRequirement',
            id: 'requirement1',
            viewerMeetsTheRequirement: false,
            label: 'Offrir mon âme à Voldemort',
          },
        },
      ],
    },
  };

  it('should render a vote widget for a simple vote without limit', () => {
    const wrapper = shallow(<RequirementsForm step={step} {...formMock} />);
    expect(wrapper).toMatchSnapshot();
  });
});
