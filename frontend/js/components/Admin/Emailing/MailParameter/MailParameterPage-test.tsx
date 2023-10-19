/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { MailParameterPage } from './MailParameterPage'
import { $refType, $fragmentRefs, formMock } from '~/mocks'

const baseProps = {
  ...formMock,
  dispatch: jest.fn(),
  emailingCampaign: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: 'emailingCampaign123',
    name: 'Je suis une emailing list',
    senderEmail: 'captain.obious@cap-collectif.com',
    senderName: 'Captain Obvious',
    object: 'Ceci est le sujet',
    content: 'Ceci est du contenu',
    mailingList: {
      id: 'mailingList123',
    },
    emailingGroup: null,
    mailingInternal: null,
    project: null,
    sendAt: '2030-03-11 00:00:00',
    status: 'DRAFT',
  },
  viewer: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    organizations: null,
  },
  query: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  },
  registeredFieldsName: ['blablaField', 'bruhField'],
}
const props = {
  basic: baseProps,
  disabled: { ...baseProps, emailingCampaign: { ...baseProps.emailingCampaign, status: 'SENT' } },
  group: {
    ...baseProps,
    emailingCampaign: {
      ...baseProps.emailingCampaign,
      mailingList: null,
      emailingGroup: {
        id: 'group2',
      },
    },
  },
}
describe('<MailParameterPage />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<MailParameterPage {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly when disabled', () => {
    const wrapper = shallow(<MailParameterPage {...props.disabled} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly with emailing group', () => {
    const wrapper = shallow(<MailParameterPage {...props.group} />)
    expect(wrapper).toMatchSnapshot()
  })
})
