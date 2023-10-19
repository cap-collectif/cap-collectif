/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { UserAdminAccount } from './UserAdminAccount'
import { intlMock, formMock, $fragmentRefs, $refType } from '../../../mocks'

describe('<UserAdminAccount/>', () => {
  const props1 = { ...formMock, intl: intlMock }
  const viewer = {
    ' $refType': $refType,
    isAdmin: true,
    isSuperAdmin: false,
  }
  it('should render when user is admin or viewer', () => {
    const userSubscribed = {
      ' $refType': $refType,
      id: 'user1',
      enabled: true,
      isViewer: true,
      locked: false,
      roles: [],
      vip: false,
      isAdmin: true,
      isSuperAdmin: false,
      subscribedToNewsLetterAt: '2018-05-03 11:11:11',
      ' $fragmentRefs': $fragmentRefs,
      isSubscribedToNewsLetter: true,
      isSubscribedToProposalNews: true,
    }
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        isViewerOrAdmin
        viewer={viewer}
        user={userSubscribed}
        initialValues={{
          roles: {
            labels: ['ROLE_USER'],
            other: null,
          },
          vip: false,
          enabled: true,
          locked: true,
          newsletter: true,
          isSubscribedToProposalNews: true,
        }}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render when user is not admin or viewer', () => {
    const userNotSubscribed = {
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      id: 'user1',
      enabled: true,
      isViewer: false,
      locked: false,
      roles: [],
      vip: false,
      isAdmin: false,
      isSuperAdmin: false,
      subscribedToNewsLetterAt: null,
      isSubscribedToNewsLetter: false,
      isSubscribedToProposalNews: false,
    }
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        user={userNotSubscribed}
        viewer={viewer}
        isViewerOrAdmin={false}
        initialValues={{
          roles: {
            labels: ['ROLE_USER'],
            other: null,
          },
          vip: false,
          enabled: false,
          locked: false,
          newsletter: false,
          isSubscribedToProposalNews: false,
        }}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render when viewer is admin and user is not super admin', () => {
    const userSubscribed = {
      ' $refType': $refType,
      id: 'user1',
      enabled: true,
      isViewer: false,
      locked: false,
      roles: [],
      vip: false,
      isAdmin: true,
      isSuperAdmin: false,
      subscribedToNewsLetterAt: '2018-05-03 11:11:11',
      ' $fragmentRefs': $fragmentRefs,
      isSubscribedToNewsLetter: true,
      isSubscribedToProposalNews: true,
    }
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        isViewerOrAdmin
        viewer={{ ...viewer, isSuperAdmin: false }}
        user={userSubscribed}
        initialValues={{
          roles: {
            labels: ['ROLE_USER'],
            other: null,
          },
          vip: false,
          enabled: true,
          locked: true,
          newsletter: true,
          isSubscribedToProposalNews: true,
        }}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render when viewer is super admin', () => {
    const userSubscribed = {
      ' $refType': $refType,
      id: 'user1',
      enabled: true,
      isViewer: false,
      locked: false,
      roles: [],
      vip: false,
      isAdmin: true,
      isSuperAdmin: false,
      subscribedToNewsLetterAt: '2018-05-03 11:11:11',
      ' $fragmentRefs': $fragmentRefs,
      isSubscribedToNewsLetter: true,
      isSubscribedToProposalNews: true,
    }
    const wrapper = shallow(
      <UserAdminAccount
        {...props1}
        isViewerOrAdmin
        viewer={viewer}
        user={userSubscribed}
        initialValues={{
          roles: {
            labels: ['ROLE_USER'],
            other: null,
          },
          vip: false,
          enabled: true,
          locked: true,
          newsletter: true,
          isSubscribedToProposalNews: true,
        }}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
