/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ConfirmPasswordModal } from './ConfirmPasswordModal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ConfirmPasswordModal />', () => {
  const props = {
    handleClose: jest.fn(),
    dispatch: jest.fn(),
  }
  it('should render an visible modal', () => {
    const wrapper = shallow(<ConfirmPasswordModal {...props} show />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render an hidden modal', () => {
    const wrapper = shallow(<ConfirmPasswordModal {...props} show={false} />)
    expect(wrapper).toMatchSnapshot()
  })
})
