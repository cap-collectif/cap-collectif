/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalCancelSending } from './ModalCancelSending'
import { $refType } from '~/mocks'

const baseProps = {
  show: true,
  onClose: jest.fn(),
  emailingCampaign: {
    ' $refType': $refType,
    id: 'emailingCampaign123',
    status: 'DRAFT',
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
describe('<ModalCancelSending />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalCancelSending {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
