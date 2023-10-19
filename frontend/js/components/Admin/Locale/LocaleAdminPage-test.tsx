/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import LocaleAdminPage from './LocaleAdminPage'

describe('<LocaleAdminPage />', () => {
  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminPage />)
    expect(wrapper).toMatchSnapshot()
  })
})
