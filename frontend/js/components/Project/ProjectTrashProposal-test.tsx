/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectTrashProposal } from './ProjectTrashProposal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectTrashProposal />', () => {
  const props = {
    projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
    isAuthenticated: true,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrashProposal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
