/* eslint-env jest */
import * as React from 'react'
import { render } from 'enzyme'
import { Sidebar } from './Sidebar'
import MockProviders from '~/testUtils'
import { features } from '~/redux/modules/default'

const userAdmin = {
  id: 'user1',
  username: 'admin',
  displayName: 'admin',
  email: 'admin@test.com',
  isEmailConfirmed: true,
  isPhoneConfirmed: true,
  newEmailToConfirm: null,
  phone: '0101010101',
  roles: ['ROLE_ADMIN'],
  uniqueId: 'admin',
  media: {
    url: 'https://source.unsplash.com/random/150x150',
  },
  _links: {
    profile: 'https://capco.dev/profile',
  },
  vip: false,
  isViewer: false,
  isAdmin: true,
  isProjectAdmin: false,
  isEvaluerOnLegacyTool: true,
  isEvaluerOnNewTool: false,
}
const userProjectAdmin = {
  id: 'VXNlcjp1c2VyVGhlbw==',
  username: 'Théo QP',
  showLocaleHeader: true,
  isEmailConfirmed: true,
  isPhoneConfirmed: false,
  phone: null,
  isAdmin: false,
  isProjectAdmin: true,
  isEvaluerOnLegacyTool: false,
  isEvaluerOnNewTool: true,
  email: 'theo@cap-collectif.com',
  newEmailToConfirm: null,
  media: {
    url: 'https://assets.cap.co/media/cache/default_avatar/default/0001/01/providerReference49.jpg',
  },
  displayName: 'Théo QP',
  uniqueId: 'theoqp',
  roles: ['ROLE_USER', 'ROLE_PROJECT_ADMIN'],
}
describe('<Sidebar />', () => {
  it('renders correctly', () => {
    const wrapper = render(
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
        <Sidebar appVersion="2020.07.07-xsinjdic" />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('links to Sonata notification settings while the migration is disabled', () => {
    const wrapper = render(
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
        <Sidebar appVersion="2020.07.07-xsinjdic" defaultAccordeon="reglages" />
      </MockProviders>,
    )
    expect(wrapper.find('a[href$="/admin/settings/settings.notifications/list"]')).toHaveLength(1)
  })
  it('links to Admin Next notification settings while the migration is enabled', () => {
    const wrapper = render(
      <MockProviders
        store={{
          default: {
            features: { ...features, unstable__sonata_migration_to_admin_next: true },
          },
          user: {
            user: userAdmin,
          },
        }}
      >
        <Sidebar appVersion="2020.07.07-xsinjdic" defaultAccordeon="reglages" />
      </MockProviders>,
    )
    expect(wrapper.find('a[href$="/admin-next/notification-settings"]')).toHaveLength(1)
  })
  it('renders when the user is a project admin and not an admin', () => {
    const wrapper = render(
      <MockProviders
        store={{
          default: {
            features,
          },
          user: {
            user: userProjectAdmin,
          },
        }}
      >
        <Sidebar appVersion="2020.07.07-xsinjdic" defaultAccordeon="contenus" />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
