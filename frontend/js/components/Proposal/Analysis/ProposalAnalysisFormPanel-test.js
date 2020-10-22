// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAnalysisFormPanel } from './ProposalAnalysisFormPanel';
import { $refType, formMock, intlMock } from '~/mocks';

describe('<ProposalAnalysisFormPanel  /> ', () => {
  it('renders correctly', () => {
    const props = {
      ...formMock,
      intl: intlMock,
      onValidate: jest.fn(),
      initialStatus: 'FAVOURABLE',
      responses: [],
      proposal: {
        id: 'id',
        $refType,
        analyses: [
          {
            id: 'a1id',
            analyst: {
              id: 'userID345',
            },
            comment: 'mwe',
            state: 'FAVOURABLE',
            responses: [],
          },
        ],
        form: {
          analysisConfiguration: {
            id: 'analysisConfigId',
            evaluationForm: {
              questions: [],
            },
          },
        },
      },
      userId: 'userID345',
    };

    const wrapper = shallow(<ProposalAnalysisFormPanel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
