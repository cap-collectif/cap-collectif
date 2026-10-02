/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Label from './Label'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Label />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Label>Bonjour</Label>)
    expect(wrapper).toMatchSnapshot()
  })
})
