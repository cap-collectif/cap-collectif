/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { UserRegister } from './UserRegister'
import { $refType, $fragmentRefs, intlMock } from '~/mocks'

const event = {
  ' $refType': $refType,
  id: '123454321',
}
const user = {
  ' $fragmentRefs': $fragmentRefs,
  ' $refType': $refType,
  username: 'Username test',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<UserRegister />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<UserRegister event={event} user={user} intl={intlMock} />)
    expect(wrapper).toMatchSnapshot()
  })
})
