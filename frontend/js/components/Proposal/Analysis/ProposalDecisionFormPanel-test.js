// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalDecisionFormPanel } from './ProposalDecisionFormPanel';
import { $refType, formMock, $fragmentRefs } from '~/mocks';

describe('<ProposalDecisionFormPanel  /> ', () => {
  it('renders correctly', () => {
    const props = {
      ...formMock,
      onValidate: jest.fn(),
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
          post: {
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

    const wrapper = shallow(<ProposalDecisionFormPanel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
