// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDetailAdvancement } from './ProposalDetailAdvancement';
import { $refType } from '../../../mocks';

describe('<ProposalDetailAdvancement />', () => {
  const proposal = {
    id: '3',
    status: null,
    $refType,
    selections: [
      {
        step: {
          id: '2',
        },
        status: {
          name: 'En cours',
          color: 'INFO',
        },
      },
    ],
    progressSteps: [],
  };

  const steps = [
    {
      id: '2',
      __typename: 'SelectionStep',
      timeless: false,
      timeRange: {
        endAt: 'endAt',
        startAt: 'startAt',
      },
      title: 'Selection 1',
      enabled: false,
    },
    {
      id: '3',
      __typename: 'CollectStep',
      timeless: false,
      timeRange: {
        endAt: 'endAt',
        startAt: 'startAt',
      },
      title: 'Collect 1',
      enabled: true,
    },
  ];

  it('should render steps with according colors', () => {
    const wrapper = shallow(
      <ProposalDetailAdvancement proposal={proposal} displayedSteps={steps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
