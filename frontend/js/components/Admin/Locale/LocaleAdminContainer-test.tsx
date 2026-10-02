/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { LocaleAdminContainer } from './LocaleAdminContainer'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<LocaleAdminContainer />', () => {
  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminContainer />)
    expect(wrapper).toMatchSnapshot()
  })
})
