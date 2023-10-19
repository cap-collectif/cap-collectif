/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import ErrorQuery from './ErrorQuery'

const props = {
  retry: jest.fn(),
}
describe('<ErrorQuery />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ErrorQuery retry={props.retry} />)
    expect(wrapper).toMatchSnapshot()
  })
})
