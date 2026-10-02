/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { LeavePageModal } from './LeavePageModal'

const props = {
  isShow: false,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Ceci est le titre',
  content: 'Ceci est le contenu',
  btnConfirmMessage: 'global-exit',
  btnCloseAndConfirmlMessage: 'save-quit',
  onCloseAndConfirm: jest.fn(),
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<LeavePageModal />', () => {
  it('render correctly', () => {
    const wrapper = shallow(<LeavePageModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
