/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalPageMainContent } from './ProposalPageMainContent'
import { $refType, $fragmentRefs } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalPageMainContent />', () => {
  const proposal = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageMainContent proposal={proposal} goToBlog={jest.fn()} isAnalysing={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly whith analysis', () => {
    const wrapper = shallow(<ProposalPageMainContent proposal={proposal} goToBlog={jest.fn()} isAnalysing />)
    expect(wrapper).toMatchSnapshot()
  })
})
