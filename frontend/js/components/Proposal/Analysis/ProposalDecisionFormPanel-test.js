// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalDecisionFormPanel } from './ProposalDecisionFormPanel';
import { $fragmentRefs, $refType, formMock } from '~/mocks';

describe('<ProposalDecisionFormPanel  /> ', () => {
  const props = {
    ...formMock,
    onValidate: jest.fn(),
    proposalRevisionsEnabled: false,
    initialIsApproved: false,
    costEstimationEnabled: true,
    proposal: {
      id: 'id',
      $fragmentRefs,
      $refType,
      assessment: {
        id: 'assessmentid2',
        officialResponse: 'ueueueueueue',
      },
      decision: {
        state: 'DONE',
        estimatedCost: 43,
        refusedReason: {
          label: 'name',
          value: 'id',
        },
        officialResponse: {
          id: 'pid',
          body: 'oe',
          authors: [
            {
              value: 'decidorId',
              label: 'username',
            },
          ],
        },
        isApproved: true,
      },
      form: {
        analysisConfiguration: {
          costEstimationEnabled: true,
          effectiveDate: 'Vers le 12 à peu près en même temps que la fermeture des locaux',
          unfavourableStatuses: [
            {
              value: 'id',
              label: 'name',
            },
          ],
        },
      },
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProposalDecisionFormPanel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with proposal revisions feature enabled', () => {
    const ownProps = { ...props, proposalRevisionsEnabled: true };
    const wrapper = shallow(<ProposalDecisionFormPanel {...ownProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
