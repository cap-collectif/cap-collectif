// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDetailAdvancement } from './ProposalDetailAdvancement';
import { $refType } from '../../../mocks';

describe('<ProposalDetailAdvancement />', () => {
  const project = {
    id: '4',
    steps: [
      {
        id: '1',
        __typename: 'CollectStep',
        timeless: false,
        timeRange: {
          endAt: 'endAt',
          startAt: 'startAt',
        },
        title: 'Collecte 1',
      },
      {
        id: '2',
        __typename: 'SelectionStep',
        timeless: false,
        timeRange: {
          endAt: 'endAt',
          startAt: 'startAt',
        },
        title: 'Selection 1',
      },
      {
        id: '3',
        __typename: 'SelectionStep',
        timeless: false,
        timeRange: {
          endAt: 'endAt',
          startAt: 'startAt',
        },
        title: 'Selection 2',
      },
    ],
  };
  const proposal = {
    id: '3',
    project,
    status: null,
    $refType,
    selections: [
      {
        step: {
          id: '2',
        },
        status: {
          name: 'En cours',
          color: 'info',
        },
      },
    ],
    progressSteps: [],
  };

  it('should render steps with according colors', () => {
    const wrapper = shallow(<ProposalDetailAdvancement proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
