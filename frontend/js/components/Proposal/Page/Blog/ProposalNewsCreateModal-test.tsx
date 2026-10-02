/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalNewsCreateModal } from './ProposalNewsCreateModal'
import { $refType, formMock } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalNewsCreateModal />', () => {
  const props = {
    ...formMock,
    show: false,
    displayModal: jest.fn(),
    currentLanguage: 'fr-FR',
    onClose: jest.fn(),
    proposal: {
      id: 'proposal1',
      ' $refType': $refType,
    },
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalNewsCreateModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with modal open', () => {
    const openedModal = { ...props, show: true }
    const wrapper = shallow(<ProposalNewsCreateModal {...openedModal} />)
    expect(wrapper).toMatchSnapshot()
  })
})
