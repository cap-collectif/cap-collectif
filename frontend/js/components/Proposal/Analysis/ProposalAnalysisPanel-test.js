// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAnalysisPanel } from './ProposalAnalysisPanel';
import { $fragmentRefs, $refType } from '~/mocks';

describe('<ProposalAnalysisPanel />', () => {
  it('renders correctly', () => {
    const props = {
      proposal: {
        $refType,
        id: 'proposalId',
        analysts: [
          {
            id: 'Eva',
            $fragmentRefs,
          },
          {
            id: 'Pipoune',
            $fragmentRefs,
          },
        ],
        decisionMaker: {
          $fragmentRefs,
        },
        supervisor: {
          $fragmentRefs,
        },
        analyses: [
          {
            id: 'analyse2Id',
            state: 'FAVOURABLE',
            updatedBy: {
              id: 'Pipoune',
            },
          },
        ],
        assessment: {
          id: 'assessmentId',
          state: 'UNFAVOURABLE',
          updatedBy: {
            id: 'Ruel',
          },
        },
        decision: {
          id: 'decisionId',
          state: 'IN_PROGRESS',
          updatedBy: {
            id: 'Ush',
          },
          isApproved: false,
        },
        viewerCanDecide: true,
        viewerCanAnalyse: false,
        viewerCanEvaluate: false,
      },
      onClose: jest.fn(),
      isAnalysing: true,
      user: { id: 'Rubilax' },
    };

    const wrapper = shallow(<ProposalAnalysisPanel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
