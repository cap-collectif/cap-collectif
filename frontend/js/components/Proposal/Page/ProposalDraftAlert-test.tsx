/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalDraftAlert } from './ProposalDraftAlert'
import { $refType } from '../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalDraftAlert />', () => {
  const proposal = {
    publicationStatus: 'DRAFT',
    form: {
      objectType: 'PROPOSAL',
    },
    ' $refType': $refType,
  }
  const proposalNotInDraft = {
    publicationStatus: 'PUBLISHED',
    form: {
      objectType: 'PROPOSAL',
    },
    ' $refType': $refType,
  }
  it('should render draft alert', () => {
    const wrapper = shallow(<ProposalDraftAlert proposal={proposal} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render draft alert', () => {
    const wrapper = shallow(<ProposalDraftAlert proposal={proposalNotInDraft} />)
    expect(wrapper).toMatchSnapshot()
  })
})
