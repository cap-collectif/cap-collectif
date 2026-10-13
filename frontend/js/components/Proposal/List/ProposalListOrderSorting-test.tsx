/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalListOrderSorting } from './ProposalListOrderSorting'
import { PROPOSAL_ORDER_RANDOM } from '../../../constants/ProposalConstants'
import { intlMock } from '../../../mocks'

const props = {
  orderByVotes: false,
  dispatch: jest.fn(),
  order: PROPOSAL_ORDER_RANDOM,
  defaultSort: PROPOSAL_ORDER_RANDOM,
  stepId: 'selectionstep1',
  objectType: 'PROPOSAL',
  intl: intlMock,
  canDisplayBallot: true,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalListOrderSorting />', () => {
  it('should render the list order sorting component', () => {
    const wrapper = shallow(<ProposalListOrderSorting {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render the list order sorting component without vote sort', () => {
    const wrapper = shallow(<ProposalListOrderSorting {...props} canDisplayBallot={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('uses the masculine commented label for projects', () => {
    const wrapper = shallow(<ProposalListOrderSorting {...props} objectType="PROJECT" orderByComments />)
    expect(wrapper).toMatchSnapshot()
  })
})
