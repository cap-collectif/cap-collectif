/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventAdmin } from './EventAdmin'

const defaultProps = {
  eventId: 'event1',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<EventAdmin />', () => {
  it('it renders correctly with event Id', () => {
    const props = { ...defaultProps }
    const wrapper = shallow(<EventAdmin {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('it renders correctly without event Id', () => {
    const props = { ...defaultProps, eventId: '' }
    const wrapper = shallow(<EventAdmin {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
