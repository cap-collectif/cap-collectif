/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ThemeCard } from './ThemeCard'
import { theme, metricsWithoutEvent } from './ThemeCard-mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ThemeCard />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ThemeCard theme={theme} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render without event metrics', () => {
    const wrapper = shallow(<ThemeCard theme={metricsWithoutEvent} />)
    expect(wrapper).toMatchSnapshot()
  })
})
