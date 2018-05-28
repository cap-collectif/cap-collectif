// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormEvaluationList } from './ProposalFormEvaluationList';
import { relayPaginationMock } from '../../mocks';

describe('<ProposalFormEvaluationList />', () => {
  const propsWithEvaluations = {
    relay: relayPaginationMock,
    // $FlowFixMe $refType
    proposalForm: {
      step: {
        title: 'My form title',
        project: {
          title: 'My Project title',
        },
      },
      proposals: {
        totalCount: 2,
        pageInfo: {
          endCursor: 'cursor1',
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: null,
        },
        edges: [
          // $FlowFixMe
          { node: { id: '1' } },
          // $FlowFixMe
          { node: { id: '2' } },
        ],
      },
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });

  const propsWithoutEvaluations = {
    relay: relayPaginationMock,
    // $FlowFixMe $refType
    proposalForm: {
      step: {
        title: 'My form title',
        project: {
          title: 'My Project title',
        },
      },
      proposals: {
        totalCount: 0,
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
        },
        edges: [],
      },
    },
  };

  it('renders nothing when no evaluations', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithoutEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });
});
