/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventImage } from './EventImage'
import { $refType } from '~/mocks'

const baseEvent = {
  ' $refType': $refType,
  media: {
    url: 'https://picsum.photos/300/400',
  },
}
const event = {
  basic: { ...baseEvent },
  noImage: { ...baseEvent, media: null },
}
describe('<EventImage />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<EventImage event={event.basic} enabled />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with not enabled', () => {
    const wrapper = shallow(<EventImage event={event.basic} enabled={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when image not find', () => {
    const wrapper = shallow(<EventImage event={event.noImage} enabled />)
    expect(wrapper).toMatchSnapshot()
  })
})
