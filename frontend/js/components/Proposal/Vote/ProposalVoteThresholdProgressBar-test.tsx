/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { $refType } from '../../../mocks'
import { ProposalVoteThresholdProgressBar } from '~/components/Proposal/Vote/ProposalVoteThresholdProgressBar'

describe('<ProposalVoteThresholdProgressBar />', () => {
  const props = {
    step: {
      voteThreshold: 2,
      ' $refType': $refType,
      id: 'step1',
    },
    showPoints: true,
  }
  it('renders progress bar in non-interpellation context', () => {
    const proposal = {
      ' $refType': $refType,
      id: 'proposal1',
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'global.consultation',
        },
      },
      votes: {
        totalCount: 1,
        totalPointsCount: 5,
      },
      paperVotesTotalCount: 0,
      paperVotesTotalPointsCount: 0,
    }
    const wrapper = shallow(<ProposalVoteThresholdProgressBar proposal={proposal} {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders progress bar in an interpellation context', () => {
    const proposal = {
      ' $refType': $refType,
      id: 'proposal1',
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'project.types.interpellation',
        },
      },
      votes: {
        totalCount: 1,
        totalPointsCount: 5,
      },
      paperVotesTotalCount: 0,
      paperVotesTotalPointsCount: 0,
    }
    const wrapper = shallow(<ProposalVoteThresholdProgressBar proposal={proposal} {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
