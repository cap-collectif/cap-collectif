/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalViewAssessmentPanel } from './ProposalViewAssessmentPanel'
import { $refType } from '~/mocks'

describe('<ProposalViewAssessmentPanel  /> ', () => {
  it('renders correctly', () => {
    const props = {
      proposal: {
        ' $refType': $refType,
        id: 'id',
        assessment: {
          id: 'assessment1',
          state: 'FAVOURABLE',
          estimatedCost: 8000,
          body: '<html>much body such html<html>',
          officialResponse: '<html>very official</html',
        },
      },
    }
    const wrapper = shallow(<ProposalViewAssessmentPanel {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
