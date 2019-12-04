// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormEvaluationList } from './ProposalFormEvaluationList';
import { $refType, $fragmentRefs, relayPaginationMock } from '../../mocks';

describe('<ProposalFormEvaluationList />', () => {
  const propsWithEvaluations = {
    relay: relayPaginationMock,
    proposalForm: {
      $refType,
      id: '1',
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
        edges: [{ node: { id: '1', $fragmentRefs } }, { node: { id: '2', $fragmentRefs } }],
      },
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });

  const propsWithoutEvaluations = {
    relay: relayPaginationMock,
    proposalForm: {
      $refType,
      id: '1',
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
