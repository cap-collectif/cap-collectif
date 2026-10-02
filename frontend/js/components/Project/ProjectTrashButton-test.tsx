/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectTrashButton } from './ProjectTrashButton'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectTrashButton />', () => {
  const props = {
    user: {},
    link: 'www.test.com',
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrashButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
