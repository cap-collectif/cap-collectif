/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAnalysisOnMobileModal } from './ProposalAnalysisOnMobileModal'

describe('<ProposalAnalysisOnMobileModal />', () => {
  it('renders correctly', () => {
    const props = {
      show: true,
      onClose: jest.fn(),
    }
    const wrapper = shallow(<ProposalAnalysisOnMobileModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
