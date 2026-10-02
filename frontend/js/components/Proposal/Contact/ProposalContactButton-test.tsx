/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalContactButton } from './ProposalContactButton'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalContactButton />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProposalContactButton proposalId="proposalId324Z" authorName="Gisele" />)
    expect(wrapper).toMatchSnapshot()
  })
})
