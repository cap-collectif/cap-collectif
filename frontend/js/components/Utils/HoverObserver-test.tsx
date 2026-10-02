/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import HoverObserver from './HoverObserver'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<HoverObserver />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <HoverObserver>
        <div className="foo" />
      </HoverObserver>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
