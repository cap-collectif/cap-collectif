/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Fixed from '~ui/Fixed/Fixed'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Fixed />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Fixed
        position={{
          top: '50px',
          left: '50px',
        }}
      >
        <p>Test</p>
      </Fixed>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render', () => {
    const wrapper = shallow(
      <Fixed
        position={{
          top: '50px',
          left: '50px',
        }}
        show={false}
      >
        <p>Test</p>
      </Fixed>,
    )
    expect(wrapper.type()).toEqual(null)
  })
})
