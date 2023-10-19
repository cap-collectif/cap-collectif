/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { MediaUploadModal } from './MediaUploadModal'

describe('<MediaUploadModal />', () => {
  const props = {
    show: true,
    closeModal: jest.fn(),
  }
  it('renders correctly', () => {
    const wrapper = shallow(<MediaUploadModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
