/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Profile } from './Profile'
import { intlMock, formMock, $refType } from '~/mocks'
import { enableFeatureFlags, disableFeatureFlags } from '~/testUtils'

describe('<Profile />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    hasValue: {},
    initialValues: {
      media: {
        id: 'media1',
        name: 'media1',
        size: '128*128',
        url: 'http://imgur.com/15645613.jpg',
      },
      username: 'username',
      biography: 'I am a fucking customer',
      facebookUrl: 'https://facebook.com/neurchi',
      linkedInUrl: 'https://linkedin.com/neurchi',
      twitterUrl: 'https://twitter.com/cuicui',
      instagramUrl: 'https://instagram.com/cuicui',
      profilePageIndexed: false,
      userType: 'VXNlclR5cGU6MQ==', // UserType:1
      neighborhood: 'DTC',
    },
  }
  const props2 = {
    ...formMock,
    intl: intlMock,
    hasValue: {},
    initialValues: {
      media: {
        id: 'media1',
        name: 'media1',
        size: '128*128',
        url: 'http://imgur.com/15645613.jpg',
      },
      username: 'username',
      biography: 'I am a fucking customer',
      facebookUrl: 'https://facebook.com/mmm',
      linkedInUrl: 'https://linkedin.com/neurchi',
      twitterUrl: 'https://twitter.com/cuicui',
      instagramUrl: 'https://instagram.com/cuicui',
      profilePageIndexed: false,
      userType: 'VXNlclR5cGU6MQ==', // UserType:1
      neighborhood: 'DTC',
    },
  }
  const viewer = {
    ' $refType': $refType,
    id: 'user1234',
    media: {
      id: 'media1',
      name: 'media1',
      size: '128*128',
      url: 'http://imgur.com/15645613.jpg',
    },
    organizations: [],
    username: 'username',
    biography: 'I am a fucking customer',
    facebookUrl: 'https://facebook.com/mmm',
    linkedInUrl: 'https://linkedin.com/neurchi',
    twitterUrl: 'https://twitter.com/cuicui',
    instagramUrl: 'https://instagram.com/cuicui',
    profilePageIndexed: false,
    userType: {
      id: '1',
    },
    neighborhood: 'DTC',
  }
  afterEach(() => {
    disableFeatureFlags()
  })
  it('should render my profile with features user_type', () => {
    enableFeatureFlags(['user_type', 'noindex_on_profiles'])
    const wrapper = shallow(
      <Profile
        viewer={viewer}
        userTypes={[
          {
            id: 1,
            name: 'type_1',
          },
        ]}
        {...props}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render my profile without features user_type', () => {
    const wrapper = shallow(
      <Profile
        viewer={viewer}
        userTypes={[
          {
            id: 1,
            name: 'type_1',
          },
        ]}
        {...props2}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
