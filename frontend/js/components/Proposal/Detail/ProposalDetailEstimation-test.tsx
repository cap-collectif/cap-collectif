/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalDetailEstimation } from './ProposalDetailEstimation'
import { $refType } from '../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalDetailEstimation />', () => {
  const proposal = {
    ' $refType': $refType,
    estimation: 100,
  }
  const proposalWithNullEstimation = {
    ' $refType': $refType,
    estimation: null,
  }
  it('should render a div when estimation is not null', () => {
    const wrapper = shallow(<ProposalDetailEstimation proposal={proposal} showNullEstimation={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a div when estimation is null and showNullEstimation is true', () => {
    const wrapper = shallow(<ProposalDetailEstimation proposal={proposalWithNullEstimation} showNullEstimation />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render a div when estimation is null and showNullEstimation is false', () => {
    const wrapper = shallow(
      <ProposalDetailEstimation proposal={proposalWithNullEstimation} showNullEstimation={false} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
