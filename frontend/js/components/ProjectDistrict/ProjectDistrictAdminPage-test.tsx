/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProjectDistrictAdminPage } from './ProjectDistrictAdminPage'
import { $fragmentRefs, $refType } from '~/mocks'

const defaultDistrict = {
  id: '1',
  ' $fragmentRefs': $fragmentRefs,
}
const defaultProps = {
  districts: {
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
    edges: [
      {
        node: defaultDistrict,
      },
      {
        node: defaultDistrict,
      },
      {
        node: defaultDistrict,
      },
    ],
  },
}
describe('<ProjectDistrictAdminPage />', () => {
  it('should render correctly with PUBLISHED status', () => {
    const wrapper = shallow(<ProjectDistrictAdminPage {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
