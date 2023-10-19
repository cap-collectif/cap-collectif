/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import TabsBarDropdown from './TabsBarDropdown'

jest.mock('reakit/Menu', () => ({
  ...jest.requireActual('reakit/Menu'),
  useMenuState: () => ({
    ...jest.requireActual('reakit/Menu').useMenuState({
      baseId: 'mock',
    }),
    unstable_popoverStyles: {
      left: '100%',
      position: 'fixed',
      top: '100%',
    },
  }),
}))
const baseProps = {
  item: {
    id: 6,
    title: 'Comment ça marche',
    link: '/pages/comment-%C3%A7a-marche',
    hasEnabledFeature: true,
    children: [],
    active: false,
  },
}
const props = {
  basic: baseProps,
  withChildren: {
    ...baseProps,
    item: {
      ...baseProps.item,
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
  },
}
describe('<TabsBarDropdown />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TabsBarDropdown {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with multiple children', () => {
    const wrapper = shallow(<TabsBarDropdown {...props.withChildren} />)
    expect(wrapper).toMatchSnapshot()
  })
})
