/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import AlertFormSucceededMessage from './AlertFormSucceededMessage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<AlertFormSucceededMessage />', () => {
  it('render correctly', () => {
    const wrapper = shallow(<AlertFormSucceededMessage />)
    expect(wrapper).toMatchSnapshot()
  })
})
