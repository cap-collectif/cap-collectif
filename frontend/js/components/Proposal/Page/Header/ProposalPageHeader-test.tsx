/* eslint-env jest */
import { shallow } from 'enzyme'
import { $fragmentRefs, $refType } from '~/mocks'
import { prepareProposalBackNavigation, ProposalPageHeader } from './ProposalPageHeader'

describe('prepareProposalBackNavigation', () => {
  it('removes participation workflow parameters from the step URL', () => {
    expect(
      prepareProposalBackNavigation(
        '/project/test-project/collect/test-step?workflow=&contributionId=UHJvcG9zYWw6cHJvcG9zYWwx',
      ),
    ).toEqual({
      returnUrl: '/project/test-project/collect/test-step',
      comesFromParticipationWorkflow: true,
    })
  })

  it('preserves unrelated parameters and the hash', () => {
    expect(
      prepareProposalBackNavigation(
        '/project/test-project/collect/test-step?workflow=&view=map&contributionId=proposal-id#proposals',
      ),
    ).toEqual({
      returnUrl: '/project/test-project/collect/test-step?view=map#proposals',
      comesFromParticipationWorkflow: true,
    })
  })

  it('leaves regular step URLs unchanged', () => {
    const stepUrl = '/project/test-project/collect/test-step?view=votes'

    expect(prepareProposalBackNavigation(stepUrl)).toEqual({
      returnUrl: stepUrl,
      comesFromParticipationWorkflow: false,
    })
  })

  it('ignores the requirements workflow URL after email confirmation', () => {
    expect(
      prepareProposalBackNavigation(
        '/requirements/step/Q29sbGVjdFN0ZXA6c3RlcC1pZA==/contribution/UHJvcG9zYWw6cHJvcG9zYWwtaWQ=',
      ),
    ).toEqual({
      returnUrl: '',
      comesFromParticipationWorkflow: true,
    })
  })
})

describe('<ProposalPageHeader />', () => {
  const proposal = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
    title: 'titre',
    author: {
      ' $fragmentRefs': $fragmentRefs,
      username: 'userAdmin',
    },
    publishedAt: '2015-01-01 00:00:00',
    createdAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    url: 'true',
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    form: {
      objectType: 'PROPOSAL',
      usingIllustration: true,
      step: {
        state: 'CLOSED',
        url: '/step',
      },
    },
    media: {
      url: '/image.exe',
    },
    category: {
      color: 'red',
      icon: null,
      categoryImage: {
        image: {
          url: './',
        },
      },
    },
    currentVotableStep: null,
  }
  const proposalWithoutTheme = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
    title: 'titre',
    author: {
      ' $fragmentRefs': $fragmentRefs,
      username: 'userAdmin',
    },
    createdAt: '2015-01-01 00:00:00',
    publishedAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    url: 'true',
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    form: {
      objectType: 'QUESTION',
      usingIllustration: true,
      step: {
        state: 'CLOSED',
        url: '/step',
      },
    },
    media: null,
    category: null,
    currentVotableStep: null,
  }
  const proposalInDraft = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
    title: 'titre',
    author: {
      ' $fragmentRefs': $fragmentRefs,
      username: 'userAdmin',
    },
    createdAt: '2015-01-01 00:00:00',
    publishedAt: null,
    updatedAt: '2015-01-05 00:10:00',
    url: 'true',
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    form: {
      objectType: 'QUESTION',
      usingIllustration: true,
      step: {
        state: 'CLOSED',
        url: '/step',
      },
    },
    media: null,
    category: null,
    currentVotableStep: null,
  }
  const props = {
    className: '',
    referer: 'http://capco.test',
    title: 'Titre',
    opinionCanBeFollowed: true,
    hasVotableStep: true,
    shouldDisplayPictures: true,
    platformLocale: 'fr-FR',
  }
  it('should render a proposal header as ProposalFrom', () => {
    const wrapper = shallow(<ProposalPageHeader step={null} proposal={proposal} viewer={null} {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a proposal header as ProposalFrom with an analysing button', () => {
    const wrapper = shallow(
      <ProposalPageHeader hasAnalysingButton step={null} proposal={proposal} viewer={null} {...props} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render theme if proposal has none and form type is question', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposalWithoutTheme} step={null} viewer={null} {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a proposal in draft', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposalInDraft} step={null} viewer={null} {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  const interpellation = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
    title: 'titre',
    author: {
      ' $fragmentRefs': $fragmentRefs,
      username: 'userAdmin',
    },
    publishedAt: '2015-01-01 00:00:00',
    createdAt: '2015-01-01 00:00:00',
    updatedAt: '2015-01-05 00:00:00',
    url: 'true',
    project: {
      type: {
        title: 'project.types.interpellation',
      },
    },
    form: {
      objectType: 'PROPOSAL',
      usingIllustration: true,
      step: {
        state: 'CLOSED',
        url: '/step',
      },
    },
    media: null,
    category: null,
    currentVotableStep: null,
  }
  it('should render an interpellation', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={interpellation} step={null} viewer={null} {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
