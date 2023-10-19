/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalPageNews } from './ProposalPageNews'
import { $refType, $fragmentRefs } from '~/mocks'

describe('<ProposalPageNews />', () => {
  const emptyProposal = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: 'proposal1',
    news: {
      edges: [],
    },
    isProposalAuthorAllowedToAddNews: true,
    viewerDidAuthor: true,
  }
  const proposal = {
    ...emptyProposal,
    news: {
      edges: [
        {
          node: {
            ' $fragmentRefs': $fragmentRefs,
            id: 'news1',
            title: 'Réponse Officielle',
          },
        },
        {
          node: {
            ' $fragmentRefs': $fragmentRefs,
            id: 'news2',
            title: 'Réponse Pas Officielle',
          },
        },
      ],
    },
  }
  it('should render correctly with viewerDidAuthor', () => {
    const wrapper = shallow(<ProposalPageNews proposal={proposal} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly without news and  with viewerDidAuthor', () => {
    const wrapper = shallow(<ProposalPageNews proposal={emptyProposal} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly and add news is not allow and  with viewerDidAuthor', () => {
    const proposalCantAddNews = { ...proposal, isProposalAuthorAllowedToAddNews: false }
    const wrapper = shallow(<ProposalPageNews proposal={proposalCantAddNews} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly without news and add news is not allow and  with viewerDidAuthor', () => {
    const proposalCantAddNews = { ...emptyProposal, isProposalAuthorAllowedToAddNews: false }
    const wrapper = shallow(<ProposalPageNews proposal={proposalCantAddNews} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  const proposalViewerDidntAuthor = { ...proposal, viewerDidAuthor: false }
  it('should render correctly without viewerDidAuthor', () => {
    const wrapper = shallow(<ProposalPageNews proposal={proposalViewerDidntAuthor} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  const emptyProposalViewerDidntAuthor = { ...emptyProposal, viewerDidAuthor: false }
  it('should render correctly without news and  without viewerDidAuthor', () => {
    const wrapper = shallow(<ProposalPageNews proposal={emptyProposalViewerDidntAuthor} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly and add news is not allow and  without viewerDidAuthor', () => {
    const proposalCantAddNews = { ...proposalViewerDidntAuthor, isProposalAuthorAllowedToAddNews: false }
    const wrapper = shallow(<ProposalPageNews proposal={proposalCantAddNews} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly without news and add news is not allow and  without viewerDidAuthor', () => {
    const proposalCantAddNews = { ...emptyProposalViewerDidntAuthor, isProposalAuthorAllowedToAddNews: false }
    const wrapper = shallow(<ProposalPageNews proposal={proposalCantAddNews} goToBlog={jest.fn()} />)
    expect(wrapper).toMatchSnapshot()
  })
})
