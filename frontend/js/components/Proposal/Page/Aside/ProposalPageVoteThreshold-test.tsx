/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalPageVoteThreshold } from './ProposalPageVoteThreshold'
import { $refType, intlMock } from '~/mocks'

describe('<ProposalPageVoteThreshold />', () => {
  const proposal = {
    ' $refType': $refType,
    votes: {
      totalCount: 30,
      totalPointsCount: 10,
    },
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    paperVotesTotalCount: 0,
    paperVotesTotalPointsCount: 0,
  }
  const stepWithVoteThreshold = {
    ' $refType': $refType,
    voteThreshold: 100,
  }
  const stepWithVoteThresholdReached = {
    ' $refType': $refType,
    voteThreshold: 20,
  }
  it('should render proposal page vote threshold', () => {
    const wrapper = shallow(
      <ProposalPageVoteThreshold intl={intlMock} proposal={proposal} step={stepWithVoteThreshold} showPoints />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render proposal page vote threshold reached', () => {
    const wrapper = shallow(
      <ProposalPageVoteThreshold
        intl={intlMock}
        proposal={proposal}
        step={stepWithVoteThresholdReached}
        showPoints={false}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
