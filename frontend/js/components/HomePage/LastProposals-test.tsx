/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { LastProposals } from './LastProposals'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<LastProposals />', () => {
  const props = {
    ids: ['proposal1', 'proposal2', 'proposal3'],
  }
  it('should render correctly', () => {
    const wrapper = shallow(<LastProposals {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
