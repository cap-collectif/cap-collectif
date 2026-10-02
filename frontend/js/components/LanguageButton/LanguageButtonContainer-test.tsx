/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { LanguageButtonContainer } from './LanguageButtonContainer'
import { features } from '~/redux/modules/default'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<LanguageButtonContainer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<LanguageButtonContainer features={features} />)
    expect(wrapper).toMatchSnapshot()
  })
})
