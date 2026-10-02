/* eslint-env jest */
import * as React from 'react'
import { render } from 'enzyme'
import { MockProviders } from '~/testUtils'
import { ModalReportArgument } from './ModalReportArgument'

const defaultProps = {
  argument: {
    id: 'argument-123',
    debateId: 'debate-123',
    forOrAgainst: 'FOR',
  },
  onClose: jest.fn(),
}
const props = {
  basic: defaultProps,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalReportArgument />', () => {
  it('should renders correcty with argument', () => {
    const wrapper = render(
      <MockProviders store={{}}>
        <ModalReportArgument {...props.basic} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
