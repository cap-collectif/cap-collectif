/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalMembers } from './ModalMembers'
import { $refType } from '~/mocks'
import { features } from '~/redux/modules/default'
import MockProviders from '~/testUtils'

const baseProps = {
  onClose: jest.fn(),
  show: true,
  mailingList: {
    ' $refType': $refType,
    id: 'mailingList-123',
    name: 'Je suis une mailing list',
  },
}
const props = {
  withData: baseProps,
}
const userAdmin = {
  id: 'user1',
  username: 'admin',
  displayName: 'admin',
  email: 'admin@test.com',
  isAdmin: true,
}
const userProjectOwner = {
  id: 'userTheo',
  username: 'Théo QP',
  displayName: 'théo',
  email: 'theo@cap-collectif.com',
  isAdmin: false,
}
describe('<ModalMembers />', () => {
  it('should render correctly for admin', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          default: {
            features,
          },
          user: {
            user: userAdmin,
          },
        }}
      >
        <ModalMembers {...props.withData} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly for project owner', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          default: {
            features,
          },
          user: {
            user: userProjectOwner,
          },
        }}
      >
        <ModalMembers {...props.withData} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
