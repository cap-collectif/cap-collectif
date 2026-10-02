/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectTrashComment } from './ProjectTrashComment'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectTrashComment />', () => {
  const props = {
    projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
    isAuthenticated: true,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrashComment {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
