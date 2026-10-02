/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalDeleteArgument } from './ModalDeleteArgument'

const props = {
  argumentInfo: {
    id: 'argument-123',
    type: 'FOR',
    debateUrl: '/debate123',
  },
  onClose: jest.fn(),
  debateId: 'debate123',
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalModerateArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalDeleteArgument {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
