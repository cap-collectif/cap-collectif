/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalNewsDeleteModal } from './ProposalNewsDeleteModal'
import { $refType, formMock } from '~/mocks'

describe('<ProposalNewsDeleteModal />', () => {
  const props = {
    ...formMock,
    showDeleteModal: false,
    displayDeleteModal: jest.fn(),
    isDeleting: false,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    post: {
      id: 'pos1',
      ' $refType': $refType,
    },
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalNewsDeleteModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with modal open', () => {
    const openedModal = { ...props, showDeleteModal: true }
    const wrapper = shallow(<ProposalNewsDeleteModal {...openedModal} />)
    expect(wrapper).toMatchSnapshot()
  })
})
