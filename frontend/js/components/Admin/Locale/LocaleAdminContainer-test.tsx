/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { LocaleAdminContainer } from './LocaleAdminContainer'

describe('<LocaleAdminContainer />', () => {
  it('renders correctly empty', () => {
    const wrapper = shallow(<LocaleAdminContainer />)
    expect(wrapper).toMatchSnapshot()
  })
})
