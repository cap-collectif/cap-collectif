/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectCard } from './ProjectCard'
import { $refType } from '~/mocks'

describe('<ProjectCard />', () => {
  const project = {
    ' $refType': $refType,
    id: 'project1',
    title: 'Name of my project',
    publishedAt: '2030-03-10 00:00:00',
    isExternal: false,
    externalLink: null,
    url: 'http://capco/project1',
    steps: [
      {
        state: 'CLOSED',
        __typename: 'PresentationStep',
      },
      {
        state: 'OPENED',
        __typename: 'ConsultationStep',
      },
      {
        state: 'CLOSED',
        __typename: 'OtherStep',
      },
      {
        state: 'CLOSED',
        __typename: 'RankingStep',
      },
    ],
    currentStep: {
      id: 'cstep',
      timeless: false,
      state: 'OPENED',
      timeRange: {
        endAt: '2030-04-10 00:00:00',
      },
    },
    type: {
      title: 'Debat',
      color: '#aa2233',
    },
    themes: [],
    cover: {
      url: '/cover.jpg',
    },
    votes: {
      totalCount: 32,
    },
    anonymousVotes: {
      totalCount: 12,
    },
    contributions: {
      totalCount: 10,
    },
    contributors: {
      totalCount: 5,
    },
    anonymousReplies: {
      totalCount: 10,
    },
    districts: {
      totalCount: 0,
      edges: [],
    },
    hasParticipativeStep: true,
    externalParticipantsCount: null,
    externalContributionsCount: null,
    externalVotesCount: null,
    archived: false,
    visibility: 'PUBLIC',
    isVotesCounterDisplayable: true,
    isContributionsCounterDisplayable: true,
    isParticipantsCounterDisplayable: true,
  }
  const archivedProject = { ...project, archived: true }
  const projectWithoutCover = { ...project, cover: null }
  const projectWithoutParticipativeStep = { ...project, hasParticipativeStep: false }
  const projectWithThemesAndDistricts = {
    ...project,
    themes: [
      {
        title: 'Politique',
      },
      {
        title: 'Education',
      },
    ],
    districts: {
      totalCount: 2,
      edges: [
        {
          node: {
            name: 'Paris',
          },
        },
        {
          node: {
            name: 'Perpignan',
          },
        },
      ],
    },
  }
  const externalProject = {
    ...project,
    isExternal: true,
    externalLink: 'www.autre-site.com',
    externalParticipantsCount: 20,
    externalContributionsCount: 34,
    externalVotesCount: 41,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} project={project} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly on project page', () => {
    const wrapper = shallow(<ProjectCard backgroundColor="#e5e5e5" isProjectsPage project={project} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly without participative step', () => {
    const wrapper = shallow(
      <ProjectCard backgroundColor="#e5e5e5" isProjectsPage project={projectWithoutParticipativeStep} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with themes and districts', () => {
    const wrapper = shallow(
      <ProjectCard backgroundColor="#e5e5e5" isProjectsPage project={projectWithThemesAndDistricts} />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly without cover', () => {
    const wrapper = shallow(<ProjectCard backgroundColor="#e5e5e5" isProjectsPage project={projectWithoutCover} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly an external project', () => {
    const wrapper = shallow(<ProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} project={externalProject} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly an archived project', () => {
    const wrapper = shallow(<ProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} project={archivedProject} />)
    expect(wrapper).toMatchSnapshot()
  })
})
