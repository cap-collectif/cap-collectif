/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import TabsBar from './TabsBar'

const baseProps = {
  items: [
    {
      id: 6,
      title: 'Comment ça marche',
      link: '/pages/comment-%C3%A7a-marche',
      hasEnabledFeature: true,
      children: [],
      active: false,
    },
    {
      id: 7,
      title: 'Comment ça marche',
      link: '/pages/comment-%C3%A7a-marche',
      hasEnabledFeature: true,
      active: false,
      children: [
        {
          id: 8,
          title: 'Contact',
          link: '/contact',
          hasEnabledFeature: true,
          active: false,
          children: [],
        },
        {
          id: 3,
          title: 'Liste des inscrits',
          link: '/members',
          hasEnabledFeature: true,
          active: false,
          children: [],
        },
      ],
    },
  ],
}
const props = {
  basic: baseProps,
}
describe('<TabsBar />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TabsBar {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
})
