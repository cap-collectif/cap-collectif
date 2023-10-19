/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import EyeBar from './EyeBar'

describe('<EyeBar />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'eye-bar',
      size: 16,
      color: 'black',
    }
    const wrapper = shallow(<EyeBar {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
