/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAnalysisStatusLabel } from './ProposalAnalysisStatusLabel'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalAnalysisStatusLabel />', () => {
  it('renders correctly', () => {
    const props = {
      text: 'skusku',
      color: 'blue',
      fontSize: 12,
      iconSize: 14,
      iconName: 'close',
    }
    const wrapper = shallow(<ProposalAnalysisStatusLabel {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
