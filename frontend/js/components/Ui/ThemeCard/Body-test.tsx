/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Body } from './Body'
import { theme, withoutMetrics } from './ThemeCard-mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Body />', () => {
  it('should rendly correctly', () => {
    const wrapper = shallow(<Body {...theme} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render without metrics', () => {
    const wrapper = shallow(<Body {...withoutMetrics} />)
    expect(wrapper).toMatchSnapshot()
  })
})
