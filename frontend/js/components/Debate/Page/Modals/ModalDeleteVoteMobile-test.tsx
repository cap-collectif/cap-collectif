/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalDeleteVoteMobile } from './ModalDeleteVoteMobile'
import { $refType } from '~/mocks'

const props = {
  debate: {
    ' $refType': $refType,
    id: 'debateId',
    viewerVote: {
      type: 'FOR',
    },
  },
  setShowArgumentForm: jest.fn(),
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalDeleteVoteMobile />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ModalDeleteVoteMobile {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
