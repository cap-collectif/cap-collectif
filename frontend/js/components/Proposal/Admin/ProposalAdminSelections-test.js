// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminSelections } from './ProposalAdminSelections';
import { intlMock, $refType } from '../../../mocks';

describe('<ProposalAdminSelections />', () => {
  const proposal = {
    $refType,
    id: '1',
    status: { id: '1' },
    progressSteps: [{ id: '1', title: 'title', startAt: '2018-08-16 15:15:39', endAt: null }],
    selections: [{ step: { id: '2' }, status: { id: '1' } }],
    project: {
      steps: [
        { id: '1', title: 'step-1', kind: 'collect', statuses: [] },
        {
          id: '2',
          title: 'step-2',
          kind: 'selection',
          allowingProgressSteps: true,
          statuses: [],
        },
      ],
    },
    paperVotes: [],
  };

  const paperVoteProposal = {
    ...proposal,
    paperVotes: [
      {
        step: {
          id: '2',
        },
        totalCount: 12,
        totalPointsCount: 42,
      },
    ],
  };
  const props = {
    dispatch: jest.fn(),
    handleSubmit: jest.fn(),
    intl: intlMock,
    initialValues: { selections: [{ step: '2', selected: true, status: null }] },
    pristine: false,
    invalid: false,
    valid: false,
    submitSucceeded: false,
    submitFailed: false,
    submitting: false,
    paperVoteEnabled: false,
    steps: [{}],
    selectionValues: [{ step: '2', selected: true, status: null }],
    projectId: 'projectId',
    proposal,
  };

  const paperVotesProps = {
    ...props,
    paperVoteEnabled: true,
    proposal: paperVoteProposal,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminSelections {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly with paper votes', () => {
    const wrapper = shallow(<ProposalAdminSelections {...paperVotesProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
