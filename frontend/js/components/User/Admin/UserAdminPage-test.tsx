/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { UserAdminPage } from './UserAdminPage'

describe('<UserAdminPage/>', () => {
  it('should render', () => {
    const wrapper = shallow(<UserAdminPage userId="userMaxime" dirty={false} />)
    wrapper.setState({
      showModal: true,
    })
    expect(wrapper).toMatchSnapshot()
  })
})
