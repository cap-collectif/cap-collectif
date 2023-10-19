/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAssessmentFormPanel } from './ProposalAssessmentFormPanel'
import { $fragmentRefs, $refType, formMock } from '~/mocks'

describe('<ProposalAssessmentFormPanel  /> ', () => {
  const props = {
    ...formMock,
    onValidate: jest.fn(),
    proposalRevisionsEnabled: false,
    initialStatus: 'FAVOURABLE',
    officialResponse: 'FIGURE TOI QUE JLA COCO',
    costEstimationEnabled: true,
    proposal: {
      id: 'id',
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      assessment: {
        id: 'assessmentid1',
        state: 'IN_PROGRESS',
        estimatedCost: 43,
        body: 'summer body lol',
        officialResponse:
          'Je ne minterdis pas de jeter un oeil sur les caméras de surveillance dès lors quaucun membre du codir ne sera présent dans le locaux.',
      },
      form: {
        analysisConfiguration: {
          costEstimationEnabled: true,
        },
      },
    },
  }
  it('renders correctly', () => {
    const wrapper = shallow(<ProposalAssessmentFormPanel {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with proposal revisions feature enabled', () => {
    const ownProps = { ...props, proposalRevisionsEnabled: true }
    const wrapper = shallow(<ProposalAssessmentFormPanel {...ownProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
