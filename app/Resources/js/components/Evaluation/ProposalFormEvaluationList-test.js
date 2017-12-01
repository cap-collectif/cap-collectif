// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormEvaluationList } from './ProposalFormEvaluationList';

describe('<ProposalFormEvaluationList />', () => {
  const propsWithEvaluations = {
    proposalForm: {
      step: {
        title: 'My form title',
        project: {
          title: 'My Project title',
        },
      },
      proposals: {
        totalCount: 2,
        edges: [{ node: { id: '1' } }, { node: { id: '2' } }],
      },
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });

  const propsWithoutEvaluations = {
    proposalForm: {
      step: {
        title: 'My form title',
        project: {
          title: 'My Project title',
        },
      },
      proposals: {
        totalCount: 0,
        edges: [],
      },
    },
  };

  it('renders nothing when no evaluations', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithoutEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });
});
