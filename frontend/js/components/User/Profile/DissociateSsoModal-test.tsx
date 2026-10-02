/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { DissociateSsoModal } from './DissociateSsoModal'
import { $refType, formMock } from '../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DissociateSsoModal />', () => {
  const defaultViewer = {
    username: 'user',
    email: 'user@franceconnect.com',
    hasPassword: false,
    ' $refType': $refType,
  }
  const globalProps = {
    viewer: { ...defaultViewer },
    ...formMock,
    show: false,
    service: 'FRANCE_CONNECT',
    title: 'FranceConnect',
    handleClose: jest.fn(),
    dispatch: jest.fn(),
  }
  it('should render modal close', () => {
    const wrapper = shallow(<DissociateSsoModal {...globalProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render modal open without password', () => {
    const wrapper = shallow(<DissociateSsoModal {...globalProps} show />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render modal open with password', () => {
    const viewer = { ...defaultViewer, hasPassword: true }
    const props = { ...globalProps, viewer: { ...viewer } }
    const wrapper = shallow(<DissociateSsoModal {...props} show />)
    expect(wrapper).toMatchSnapshot()
  })
})
