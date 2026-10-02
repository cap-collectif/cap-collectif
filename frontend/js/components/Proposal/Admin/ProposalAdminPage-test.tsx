/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAdminPage } from './ProposalAdminPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalAdminPage />', () => {
  const props = {
    proposalId: 1,
    dirty: false,
    proposalRevisionsEnabled: false,
    viewerIsAdmin: true,
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
