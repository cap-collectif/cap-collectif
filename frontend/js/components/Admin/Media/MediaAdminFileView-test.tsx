/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { MediaAdminFileView } from './MediaAdminFileView'

describe('<MediaAdminFileView />', () => {
  const props = {
    extension: 'jpg',
  }
  it('renders correctly', () => {
    const wrapper = shallow(<MediaAdminFileView {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
