/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalCollectStatus } from './ProposalCollectStatus'
import { $refType } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalCollectStatus />', () => {
  const proposalWithoutStatus = {
    proposal: {
      ' $refType': $refType,
      status: null,
    },
  }
  const proposalWithStatus = {
    proposal: {
      ' $refType': $refType,
      status: {
        name: 'Terminé',
        color: 'SUCCESS',
      },
    },
  }
  it('renders proposal without status', () => {
    const wrapper = shallow(<ProposalCollectStatus {...proposalWithoutStatus} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders proposal with status', () => {
    const wrapper = shallow(<ProposalCollectStatus {...proposalWithStatus} />)
    expect(wrapper).toMatchSnapshot()
  })
})
