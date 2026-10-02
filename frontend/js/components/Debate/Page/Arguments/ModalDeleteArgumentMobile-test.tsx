/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalDeleteArgumentMobile } from './ModalDeleteArgumentMobile'
import { $refType } from '~/mocks'

const defaultProps = {
  argument: {
    ' $refType': $refType,
    id: 'argument-123',
    debate: {
      id: 'debate-123',
    },
  },
  hidePreviousModal: jest.fn(),
}
const props = {
  basic: defaultProps,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalDeleteArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalDeleteArgumentMobile {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
