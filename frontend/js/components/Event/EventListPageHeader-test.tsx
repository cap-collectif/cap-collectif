/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { EventListPageHeader } from './EventListPageHeader'
import { intlMock, $refType } from '~/mocks'
import { features } from '~/redux/modules/default'

describe('<EventListPageHeader />', () => {
  const props = {
    eventPageTitle: '<p>Titre personnalisé</p>',
    intl: intlMock,
    isAuthenticated: true,
    features: { ...features },
    queryViewer: {
      viewer: {
        isAdmin: false,
      },
      ' $refType': $refType,
    },
  }
  it('renders correcty', () => {
    const wrapper = shallow(<EventListPageHeader {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly without title', () => {
    const noTitle = { ...props, eventPageTitle: '' }
    const wrapper = shallow(<EventListPageHeader {...noTitle} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with a non authenticated user', () => {
    const nonAuthenticated = { ...props, isAuthenticated: false }
    const wrapper = shallow(<EventListPageHeader {...nonAuthenticated} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with the create event feature toggle set to true', () => {
    const createEventTrue = { ...props, features: { ...features, allow_users_to_propose_events: true } }
    const wrapper = shallow(<EventListPageHeader {...createEventTrue} />)
    expect(wrapper).toMatchSnapshot()
  })
})
