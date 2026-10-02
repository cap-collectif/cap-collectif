/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAnalysisOnMobileModal } from './ProposalAnalysisOnMobileModal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
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
