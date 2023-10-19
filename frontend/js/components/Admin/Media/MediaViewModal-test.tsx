/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { MediaViewModal } from './MediaViewModal'

describe('<MediaViewModal />', () => {
  const props = {
    show: true,
    closeModal: jest.fn(),
    url: '/media/photoCompromettanteDeOmarNaked.exe',
  }
  it('renders correctly', () => {
    const wrapper = shallow(<MediaViewModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
