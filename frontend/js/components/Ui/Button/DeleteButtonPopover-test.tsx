/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { DeleteButtonPopover } from './DeleteButtonPopover'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DeleteButtonPopover />', () => {
  it('renders correctly', () => {
    const props = {
      handleValidate: jest.fn(),
      id: '<mock-id/>',
    }
    const wrapper = shallow(<DeleteButtonPopover {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
