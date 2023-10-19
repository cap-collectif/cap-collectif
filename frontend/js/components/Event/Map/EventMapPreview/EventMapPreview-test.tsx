/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventMapPreview } from './EventMapPreview'
import { $fragmentRefs, $refType } from '~/mocks'

const baseEvent = {
  ' $fragmentRefs': $fragmentRefs,
  ' $refType': $refType,
  id: '1',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
  url: '#',
  timeRange: {
    startAt: '2030-03-10 00:00:00',
  },
  googleMapsAddress: {
    __typename: 'GoogleMapsAddress',
    ' $fragmentRefs': $fragmentRefs,
  },
  author: {
    ' $fragmentRefs': $fragmentRefs,
  },
}
const event = {
  basic: { ...baseEvent },
  withoutAddress: { ...baseEvent, googleMapsAddress: null },
  withoutDate: {
    ...baseEvent,
    timeRange: {
      startAt: null,
    },
  },
}
describe('<EventMapPreview />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<EventMapPreview event={event.basic} hasIllustrationDisplayed />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render  when illustration not displayed', () => {
    const wrapper = shallow(<EventMapPreview event={event.basic} hasIllustrationDisplayed={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when no googleMapsAddress', () => {
    const wrapper = shallow(<EventMapPreview event={event.withoutAddress} hasIllustrationDisplayed />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when no date', () => {
    const wrapper = shallow(<EventMapPreview event={event.withoutDate} hasIllustrationDisplayed />)
    expect(wrapper).toMatchSnapshot()
  })
})
