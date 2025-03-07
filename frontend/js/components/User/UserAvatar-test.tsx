/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { UserAvatarRender } from './UserAvatar'
import { features } from '~/redux/modules/default'
import MockProviders from '~/testUtils'

describe('<UserAvatar />', () => {
  const getTree = props =>
    ReactTestRenderer.create(
      <MockProviders>
        <UserAvatarRender {...props} />
      </MockProviders>,
    )

  it('renders correctly', () => {
    const props = {
      user: {
        username: 'toto',
        avatarUrl: 'http://media12/profileAvatar.jpg',
        url: '',
      },
      size: 'xs',
      className: 'mr-10',
    }
    expect(getTree(props)).toMatchSnapshot()
  })
  it('renders correctly user without avatar', () => {
    const props = {
      user: {
        username: 'toto',
        avatarUrl: null,
        url: '',
      },
      size: 'xs',
    }
    expect(getTree(props)).toMatchSnapshot()
  })
  it('renders correctly with custom default avatar', () => {
    const props = {
      features,
      user: {
        username: 'toto',
        avatarUrl: null,
        url: '',
      },
      defaultAvatar: 'http://avatar/customAvatar.jpg',
      size: 16,
    }
    expect(getTree(props)).toMatchSnapshot()
  })
  it('renders correctly with default avatar needed', () => {
    const props = {
      user: {
        username: 'toto',
        avatarUrl: 'http://media12/profileAvatar.jpg',
        url: '',
      },
      size: 'xs',
      className: 'mr-10',
    }
    expect(getTree(props)).toMatchSnapshot()
  })
})
