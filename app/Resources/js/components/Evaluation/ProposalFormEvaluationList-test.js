// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormEvaluationList } from './ProposalFormEvaluationList';

describe('<ProposalFormEvaluationList />', () => {
  const propsWithEvaluations = {
    // $FlowFixMe $refType
    proposalForm: {
      step: {
        title: 'My form title',
        project: {
          title: 'My Project title'
        }
      },
      proposals: {
        totalCount: 2,
        edges: [
          // $FlowFixMe
          { node: { id: '1' } },
          // $FlowFixMe
          { node: { id: '2' } }
        ]
      }
    }
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });

  const propsWithoutEvaluations = {
    // $FlowFixMe $refType
    proposalForm: {
      step: {
        title: 'My form title',
        project: {
          title: 'My Project title'
        }
      },
      proposals: {
        totalCount: 0,
        edges: []
      }
    }
  };

  it('renders nothing when no evaluations', () => {
    const wrapper = shallow(<ProposalFormEvaluationList {...propsWithoutEvaluations} />);
    expect(wrapper).toMatchSnapshot();
  });
});
