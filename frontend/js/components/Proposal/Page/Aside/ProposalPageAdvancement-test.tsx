/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalPageAdvancement } from './ProposalPageAdvancement'
import { $refType, $fragmentRefs } from '~/mocks'

const project = {
  id: '4',
  steps: [
    {
      id: '1',
      __typename: 'CollectStep',
      timeless: false,
      timeRange: {
        endAt: 'endAt',
        startAt: 'startAt',
      },
      title: 'Collecte 1',
      enabled: true,
    },
    {
      id: '2',
      __typename: 'CollectStep',
      timeless: false,
      timeRange: {
        endAt: 'endAt',
        startAt: 'startAt',
      },
      title: 'Collecte 2',
      enabled: true,
    },
  ],
}
const proposal = {
  status: null,
  selections: [
    {
      step: {
        id: '2',
      },
      status: {
        name: 'En cours',
        color: 'INFO',
      },
    },
  ],
  project,
  ' $refType': $refType,
  ' $fragmentRefs': $fragmentRefs,
  progressSteps: [],
}
describe('<ProposalPageAdvancement />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageAdvancement proposal={proposal} />)
    expect(wrapper).toMatchSnapshot()
  })
  const oneStepProposal = {
    ...proposal,
    project: {
      id: '4',
      steps: [
        {
          id: '1',
          __typename: 'CollectStep',
          timeless: false,
          timeRange: {
            endAt: 'endAt',
            startAt: 'startAt',
          },
          title: 'Collecte 1',
          enabled: true,
        },
      ],
    },
  }
  it('should not render with one step', () => {
    const wrapper = shallow(<ProposalPageAdvancement proposal={oneStepProposal} />)
    expect(wrapper).toMatchSnapshot()
  })
})
