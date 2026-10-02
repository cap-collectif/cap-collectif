/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SSOSwitchUserPage } from './SSOSwitchUserPage'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<SSOSwitchUserPage />', () => {
  const props = {
    destination: 'https://www.linkedin.com/in/treibert-jean/?originalSubdomain=fr',
    user: {
      username: 'Enjoy Phoenix',
    },
  }
  it('renders with a user', () => {
    const wrapper = shallow(<SSOSwitchUserPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders without a user', () => {
    const wrapper = shallow(<SSOSwitchUserPage destination="https://capco.dev/" user={null} />)
    expect(wrapper).toMatchSnapshot()
  })
})
