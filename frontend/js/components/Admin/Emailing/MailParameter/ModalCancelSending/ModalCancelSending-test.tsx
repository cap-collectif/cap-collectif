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
describe('<ModalCancelSending />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalCancelSending {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
