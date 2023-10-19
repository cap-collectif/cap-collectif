/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalPreviewBody } from './ProposalPreviewBody'
import { $refType, $fragmentRefs } from '../../../mocks'
import { features } from '../../../redux/modules/default'

describe('<ProposalPreviewBody />', () => {
  const defaultProps = {
    proposal: {
      isArchived: false,
      id: 'proposal1',
      slug: 'proposal-title',
      title: 'proposalTitle',
      trashed: false,
      trashedStatus: 'INVISIBLE',
      url: 'http://plateform/project1/step1/proposal1',
      summaryOrBodyExcerpt: 'summaryOrBodyExcerpt',
      media: {
        url: 'http://image.png',
        name: 'media1',
      },
      district: {
        name: 'district9',
      },
      theme: {
        title: 'themeI',
      },
      category: {
        name: 'string',
      },
      currentVotableStep: {
        id: 'step1',
        votesRanking: true,
      },
      form: {
        objectType: 'PROPOSAL',
      },
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    },
    features,
    step: {
      id: 'step1',
      url: '/step',
      voteThreshold: 2,
      voteType: 'SIMPLE',
      project: {
        opinionCanBeFollowed: true,
      },
      canDisplayBallot: true,
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    },
    viewer: {
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    },
  }
  it('should render a proposal preview', () => {
    const wrapper = shallow(<ProposalPreviewBody {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should hide vote button if proposal is archived', () => {
    const props = { ...defaultProps, proposal: { ...defaultProps.proposal, isArchived: true } }
    const wrapper = shallow(<ProposalPreviewBody {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
