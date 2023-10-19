/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalUserVoteItem } from './ProposalUserVoteItem'
import { $refType, $fragmentRefs, intlMock } from '~/mocks'

describe('<ProposalUserVoteItem />', () => {
  const vote = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    published: true,
    createdAt: '2015-01-01 00:00:00',
    proposal: {
      id: '1',
      estimation: null,
      title: 'proposal',
      url: 'http://capco.test/proposal',
    },
  }
  const step = {
    id: '1',
    open: true,
    votesRanking: false,
    voteType: 'SIMPLE',
    form: {
      objectType: 'QUESTION',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    ' $refType': $refType,
  }
  const props = {
    intl: intlMock,
    onDelete: jest.fn(),
    isAuthenticated: true,
    smsVoteEnabled: false,
  }
  it('should render a vote item', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem isVoteVisibilityPublic member="votes.1" {...props} step={step} vote={vote} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  const stepInterpellation = {
    id: '1',
    open: true,
    votesRanking: false,
    voteType: 'SIMPLE',
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'project.types.interpellation',
      },
    },
    ' $refType': $refType,
  }
  it('should render a support item', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem isVoteVisibilityPublic member="votes.1" {...props} step={stepInterpellation} vote={vote} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  const voteInterpellation = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    published: true,
    createdAt: '',
    proposal: {
      id: '1',
      estimation: 4,
      title: 'proposal',
      url: 'http://capco.test/proposal',
    },
  }
  it('should render a support item without createdAt', () => {
    const wrapper = shallow(
      <ProposalUserVoteItem
        isVoteVisibilityPublic
        member="votes.1"
        {...props}
        step={stepInterpellation}
        vote={voteInterpellation}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
