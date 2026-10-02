/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { UserAdminPage } from './UserAdminPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<UserAdminPage/>', () => {
  it('should render', () => {
    const wrapper = shallow(<UserAdminPage userId="userMaxime" dirty={false} />)
    wrapper.setState({
      showModal: true,
    })
    expect(wrapper).toMatchSnapshot()
  })
})
