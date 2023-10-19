/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalInternalMembers } from './ModalInternalMembers'
import { EmailingCampaignInternalList } from '~relay/Parameter_emailingCampaign.graphql'

const baseProps = {
  onClose: jest.fn(),
  show: true,
  type: 'REGISTERED' as EmailingCampaignInternalList,
}
const props = {
  basic: baseProps,
  confirmedUsers: { ...baseProps, type: 'CONFIRMED' as EmailingCampaignInternalList },
  notConfirmedUsers: { ...baseProps, type: 'NOT_CONFIRMED' as EmailingCampaignInternalList },
}
describe('<ModalInternalMembers />', () => {
  it('should open with internal list with registered users', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should open with internal list with confirmed users', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.confirmedUsers} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should open with internal list with not confirmed users', () => {
    const wrapper = shallow(<ModalInternalMembers {...props.notConfirmedUsers} />)
    expect(wrapper).toMatchSnapshot()
  })
})
