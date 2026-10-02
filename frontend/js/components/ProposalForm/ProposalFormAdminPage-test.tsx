/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormAdminPage } from './ProposalFormAdminPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalFormAdminPage />', () => {
  const props = {
    proposalFormId: '1',
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
