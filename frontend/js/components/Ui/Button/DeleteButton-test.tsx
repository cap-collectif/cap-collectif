/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import DeleteButton from './DeleteButton'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DeleteButton />', () => {
  it('renders correctly', () => {
    const props = {
      onClick: jest.fn(),
    }
    const wrapper = shallow(<DeleteButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
