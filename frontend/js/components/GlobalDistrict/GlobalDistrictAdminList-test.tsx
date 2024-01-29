/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { GlobalDistrictAdminPage } from './GlobalDistrictAdminPage'
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
describe('<GlobalDistrictAdminPage />', () => {
  it('should render correctly no districts', () => {
    const wrapper = shallow(<GlobalDistrictAdminPage {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
