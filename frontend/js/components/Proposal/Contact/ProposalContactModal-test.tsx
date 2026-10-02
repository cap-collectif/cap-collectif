/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalContactModal } from './ProposalContactModal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalContactModal />', () => {
  it('renders correctly', () => {
    const props = {
      proposalId: 'proposalId324Z',
      authorName: 'Gertrude',
      onClose: jest.fn(),
      addCaptchaField: false,
      show: false,
    }
    const wrapper = shallow(<ProposalContactModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
