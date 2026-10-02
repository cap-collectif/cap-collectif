/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { FontForm } from './FontForm'
import { formMock } from '~/mocks'

const props = { ...formMock, handleFontLoading: jest.fn(), handleFormError: jest.fn() }
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<FontAdminContent />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
