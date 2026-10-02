/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { TagUser } from './TagUser'
import { $fragmentRefs, $refType } from '~/mocks'

const user = {
  ' $fragmentRefs': $fragmentRefs,
  ' $refType': $refType,
  media: {
    url: "url de l'image",
  },
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<TagUser />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TagUser user={user} size={15} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(<TagUser user={user} size={20} />)
    expect(wrapper).toMatchSnapshot()
  })
})
