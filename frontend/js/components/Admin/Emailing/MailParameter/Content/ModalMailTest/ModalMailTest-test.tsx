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
describe('<ModalMailTest />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalMailTest {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
