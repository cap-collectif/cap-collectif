/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import AvatarBadge from '~ui/Medias/AvatarBadge/AvatarBadge'
import { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'

const props = {
  src: 'https://source.unsplash.com/collection/181462',
  alt: 'my alternative',
  size: 20,
  badgeSize: 10,
  color: 'red',
  icon: ICON_NAME.facebook,
  iconColor: '#fff',
  iconSize: 5,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<AvatarBadge />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<AvatarBadge {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
