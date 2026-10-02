/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import LocaleAdminPage from './LocaleAdminPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<LocaleAdminPage />', () => {
  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminPage />)
    expect(wrapper).toMatchSnapshot()
  })
})
