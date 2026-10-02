/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Language } from './Language'
import { $refType } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Language />', () => {
  const defaultProps = {
    language: {
      ' $refType': $refType,
      translated: true,
      name: 'Français',
    },
  }
  it('should render correctly', () => {
    const wrapper = shallow(<Language {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when not translated', () => {
    const props = {
      language: {
        ' $refType': $refType,
        translated: false,
        name: 'Français',
      },
    }
    const wrapper = shallow(<Language {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
