/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAnalysisFormPanel } from './ProposalAnalysisFormPanel'
import { $refType, formMock, intlMock, $fragmentRefs } from '~/mocks'

describe('<ProposalAnalysisFormPanel  /> ', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    onValidate: jest.fn(),
    initialStatus: 'FAVOURABLE',
    responses: [],
    proposalRevisionsEnabled: false,
    proposal: {
      id: 'id',
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      analyses: [
        {
          ' $fragmentRefs': $fragmentRefs,
          id: 'a1id',
          analyst: {
            id: 'userID345',
          },
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
    viewer: {
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    },
    userId: 'userID345',
  }
  it('renders correctly', () => {
    const wrapper = shallow(<ProposalAnalysisFormPanel {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with proposal revisions feature enabled', () => {
    const ownProps = { ...props, proposalRevisionsEnabled: true }
    const wrapper = shallow(<ProposalAnalysisFormPanel {...ownProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
