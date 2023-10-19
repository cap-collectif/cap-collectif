/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { SendingPage } from './index'
import { $refType } from '~/mocks'

const baseProps = {
  dispatch: jest.fn(),
  disabled: false,
  showError: false,
  sendingSchedule: false,
  emailingCampaign: {
    ' $refType': $refType,
    status: 'DRAFT',
    sendAt: '2030-03-11 00:00:00',
  },
}
const props = {
  basic: baseProps,
  disabled: { ...baseProps, disabled: true, emailingCampaign: { ...baseProps.emailingCampaign, status: 'SENT' } },
  withError: { ...baseProps, showError: true },
  withSendSchedule: {
    ...baseProps,
    sendingSchedule: true,
    emailingCampaign: { ...baseProps.emailingCampaign, status: 'PLANNED' },
  },
}
describe('<SendingPage />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<SendingPage {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly when disabled', () => {
    const wrapper = shallow(<SendingPage {...props.disabled} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly when error', () => {
    const wrapper = shallow(<SendingPage {...props.withError} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly with sending schedule', () => {
    const wrapper = shallow(<SendingPage {...props.withSendSchedule} />)
    expect(wrapper).toMatchSnapshot()
  })
})
