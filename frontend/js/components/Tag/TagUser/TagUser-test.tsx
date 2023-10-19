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
