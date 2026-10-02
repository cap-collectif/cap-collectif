/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ResetPasswordForm } from './ResetPasswordForm'
import { formMock } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ResetPasswordForm />', () => {
  const props = { ...formMock, token: 'ken-le-token', dispatch: jest.fn() }
  it('should render correctly', () => {
    const wrapper = shallow(<ResetPasswordForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
