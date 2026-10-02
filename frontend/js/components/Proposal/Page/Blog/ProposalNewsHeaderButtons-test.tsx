/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ProposalNewsHeaderButtons from './ProposalNewsHeaderButtons'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalNewsHeaderButtons />', () => {
  const props = {
    postId: 'aPost',
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalNewsHeaderButtons {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
