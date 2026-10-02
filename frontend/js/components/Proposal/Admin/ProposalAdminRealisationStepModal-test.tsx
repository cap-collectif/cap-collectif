/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAdminRealisationStepModal } from './ProposalAdminRealisationStepModal'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalAdminRealisationStepModal />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    member: 'member',
    isCreating: true,
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminRealisationStepModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
