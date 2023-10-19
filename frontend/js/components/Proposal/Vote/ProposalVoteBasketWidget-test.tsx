/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalVoteBasketWidget } from './ProposalVoteBasketWidget'
import { relayRefetchMock as relay, $refType } from '~/mocks'
import { features } from '~/redux/modules/default'

describe('<ProposalVoteBasketWidget />', () => {
  const colorProps = {
    voteBarBackgroundColor: '#FFF',
    voteBarBorderColor: '#AAA',
    voteBarButtonBgColor: '#CCC',
    voteBarButtonTextColor: '#000',
    voteBarTextColor: '#333',
  }
  const simpleWithoutLimitProps = {
    features,
    ...colorProps,
    step: {
      ' $refType': $refType,
      votesMin: null,
      viewerVotes: {
        totalCount: 5,
      },
      votesLimit: null,
      voteType: 'SIMPLE',
      budget: null,
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        slug: '/consult',
        type: {
          title: 'global.consultation',
        },
      },
      isProposalSmsVoteEnabled: false,
    },
    isAuthenticated: true,
    viewer: {
      ' $refType': $refType,
      proposalVotes: {
        totalCount: 0,
        creditsSpent: null,
      },
    },
    votesPageUrl: 'http//capco.dev/votes',
    image: 'http://capco.dev/images.png',
    relay,
  }
  const simpleWithLimitProps = {
    ...colorProps,
    features,
    step: {
      ' $refType': $refType,
      votesMin: null,
      viewerVotes: {
        totalCount: 2,
      },
      voteType: 'SIMPLE',
      budget: null,
      votesLimit: 2,
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        slug: '/consult',
        type: {
          title: 'global.consultation',
        },
      },
      isProposalSmsVoteEnabled: false,
    },
    isAuthenticated: true,
    votesPageUrl: 'http//capco.dev/votes',
    viewer: {
      ' $refType': $refType,
      proposalVotes: {
        totalCount: 1,
        creditsSpent: null,
      },
    },
    image: 'http://capco.dev/images.png',
    relay,
    ' $refType': $refType,
  }
  const budgetProps = {
    ...colorProps,
    features,
    step: {
      ' $refType': $refType,
      votesMin: null,
      viewerVotes: {
        totalCount: 1,
      },
      voteType: 'SIMPLE',
      budget: 350000,
      votesLimit: null,
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        slug: '/consult',
        type: {
          title: 'global.consultation',
        },
      },
      isProposalSmsVoteEnabled: false,
    },
    isAuthenticated: true,
    votesPageUrl: 'http//capco.dev/votes',
    viewer: {
      ' $refType': $refType,
      proposalVotes: {
        totalCount: 12,
        creditsSpent: null,
      },
    },
    image: 'http://capco.dev/images.png',
    relay,
  }
  const simpleWithLimitPropsInterpellation = {
    features,
    ...colorProps,
    step: {
      ' $refType': $refType,
      voteType: 'SIMPLE',
      votesMin: null,
      budget: null,
      votesLimit: 2,
      viewerVotes: {
        totalCount: 0,
      },
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        slug: '/interpell',
        type: {
          title: 'project.types.interpellation',
        },
      },
      isProposalSmsVoteEnabled: false,
    },
    isAuthenticated: true,
    votesPageUrl: 'http//capco.dev/votes',
    viewer: {
      ' $refType': $refType,
      proposalVotes: {
        totalCount: 1,
        creditsSpent: null,
      },
    },
    image: 'http://capco.dev/images.png',
    relay,
    ' $refType': $refType,
  }
  const anonVoteProps = {
    ...colorProps,
    viewer: null,
    features: { ...features, twilio: true, proposal_sms_vote: true },
    step: {
      ' $refType': $refType,
      votesMin: null,
      viewerVotes: {
        totalCount: 5,
      },
      votesLimit: null,
      voteType: 'SIMPLE',
      budget: null,
      form: {
        objectType: 'PROPOSAL',
      },
      project: {
        slug: '/consult',
        type: {
          title: 'global.consultation',
        },
      },
      isProposalSmsVoteEnabled: true,
    },
    isAuthenticated: false,
    votesPageUrl: 'http//capco.dev/votes',
    image: 'http://capco.dev/images.png',
    relay,
  }
  it('should render a vote widget for a simple vote without limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithoutLimitProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a vote widget for a simple vote with limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithLimitProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a vote widget for a budget vote', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...budgetProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a vote widget for a simple support with limit', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...simpleWithLimitPropsInterpellation} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should hide votes button when anon vote is enabled and user is anonymous ', () => {
    const wrapper = shallow(<ProposalVoteBasketWidget {...anonVoteProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
