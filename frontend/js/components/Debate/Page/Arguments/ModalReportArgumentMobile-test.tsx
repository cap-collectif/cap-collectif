/* eslint-env jest */
import * as React from 'react'
import { render } from 'enzyme'
import { MockProviders } from '~/testUtils'
import { ModalReportArgumentMobile } from './ModalReportArgumentMobile'
import { $refType } from '~/mocks'

const defaultProps = {
  show: true,
  argument: {
    ' $refType': $refType,
    id: 'argument-123',
    type: 'FOR',
    debate: {
      id: 'debate-123',
    },
  },
  onClose: jest.fn(),
}
const props = {
  basic: defaultProps,
  notShow: { ...defaultProps, show: false },
}
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn(element => {
    return element
  }),
}))

global.Math.random = () => 0.5

describe('<ModalReportArgumentMobile />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = render(
      <MockProviders store={{}} useCapUIProvider>
        <ModalReportArgumentMobile {...props.basic} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correcty when not show', () => {
    const wrapper = render(
      <MockProviders store={{}} useCapUIProvider>
        <ModalReportArgumentMobile {...props.notShow} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
