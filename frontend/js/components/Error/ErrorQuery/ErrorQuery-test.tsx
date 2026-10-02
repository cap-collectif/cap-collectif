/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import ErrorQuery from './ErrorQuery'

const props = {
  retry: jest.fn(),
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ErrorQuery />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ErrorQuery retry={props.retry} />)
    expect(wrapper).toMatchSnapshot()
  })
})
