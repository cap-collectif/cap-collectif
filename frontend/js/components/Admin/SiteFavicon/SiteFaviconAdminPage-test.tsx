/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SiteFaviconAdminPage } from './SiteFaviconAdminPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<SiteFaviconAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<SiteFaviconAdminPage />)
    expect(wrapper).toMatchSnapshot()
  })
})
