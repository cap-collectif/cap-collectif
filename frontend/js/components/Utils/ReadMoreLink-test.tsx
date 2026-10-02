/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ReadMoreLink from './ReadMoreLink'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ReadMoreLink />', () => {
  const emptyFunction = () => {}

  it('should not render anything if not visible', () => {
    const wrapper = shallow(<ReadMoreLink visible={false} expanded={false} onClick={emptyFunction} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a button with correct label if not expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded={false} onClick={emptyFunction} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a button with correct label if expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded onClick={emptyFunction} />)
    expect(wrapper).toMatchSnapshot()
  })
})
