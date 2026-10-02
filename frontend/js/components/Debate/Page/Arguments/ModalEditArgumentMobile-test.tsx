/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalEditArgumentMobile } from './ModalEditArgumentMobile'
import { $refType, $fragmentRefs } from '~/mocks'

const defaultProps = {
  argument: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: 'argument-123',
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
describe('<ModalEditArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = shallow(<ModalEditArgumentMobile {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
