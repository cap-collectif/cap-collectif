/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { DeleteModal } from './DeleteModal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<DeleteModal />', () => {
  const props = {
    showDeleteModal: true,
    closeDeleteModal: jest.fn(),
    deleteElement: jest.fn(),
    deleteModalTitle: 'titre.de.la.modal.de.suppression',
    deleteModalContent: 'contenu.de.la.modal.de.suppression',
    groupTitle: 'utilisateurs',
  }
  it('render correctly Delete Modal', () => {
    const wrapper = shallow(<DeleteModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
