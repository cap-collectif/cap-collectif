/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalMailTest } from './ModalMailTest'
import { $refType, formMock } from '~/mocks'

const baseProps = {
  ...formMock,
  show: true,
  onClose: jest.fn(),
  dispatch: jest.fn(),
  emailingCampaign: {
    ' $refType': $refType,
    id: 'emailingCampaign123',
  },
}
const props = {
  basic: baseProps,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalMailTest />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalMailTest {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
