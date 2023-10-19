/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ThemeCard } from './ThemeCard'
import { theme, metricsWithoutEvent } from '../../../stories/mocks/theme'

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
