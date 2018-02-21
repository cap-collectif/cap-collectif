// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminSelections } from './ProposalAdminSelections';
import { intlMock } from '../../../mocks';

describe('<ProposalAdminSelections />', () => {
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
    steps: [{}],
    selectionValues: [{ step: '2', selected: true, status: null }],
    projectId: 'projectId',
    // $FlowFixMe $refType
    proposal: {
      id: '1',
      status: { id: '1' },
      progressSteps: [{ id: '1', title: 'title', startAt: null, endAt: null }],
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
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminSelections {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
