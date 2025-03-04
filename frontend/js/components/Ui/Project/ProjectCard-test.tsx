/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProjectCardTestQuery } from '~relay/ProjectCardTestQuery.graphql'
import ProjectCard from './ProjectCard'

describe('<ProjectCard />', () => {
  let environment: any
  let testComponentTree: any
  let TestProjectCard: any

  const query = graphql`
    query ProjectCardTestQuery($id: ID = "project1") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectCard_project
      }
    }
  `

  const project = {
    id: 'project1',
    title: 'Name of my project',
    publishedAt: '2030-03-10 00:00:00',
    isExternal: false,
    externalLink: null,
    url: 'http://capco/project1',
    status: 'OPENED_PARTICIPATION',
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
    paperVotesTotalCount: 0,
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

  const paperVotesProject = {
    ...project,
    paperVotesTotalCount: 10,
  }

  const defaultMockResolvers = {
    Project: () => project,
  }

  const archivedMockResolvers = {
    Project: () => archivedProject,
  }

  const withoutCoverMockResolvers = {
    Project: () => projectWithoutCover,
  }

  const withoutParticipativeStepMockResolvers = {
    Project: () => projectWithoutParticipativeStep,
  }

  const withThemesAndDistrictsMockResolvers = {
    Project: () => projectWithThemesAndDistricts,
  }

  const externalMockResolvers = {
    Project: () => externalProject,
  }

  const paperVotesMockResolvers = {
    Project: () => paperVotesProject,
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({
      componentProps,
      queryVariables: variables,
    }: {
      componentProps: any
      queryVariables: any
    }) => {
      const data = useLazyLoadQuery<ProjectCardTestQuery>(query, variables)

      if (data?.project) {
        return <ProjectCard project={data?.project} {...componentProps} />
      }

      return null
    }

    TestProjectCard = (componentProps: any) => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestProjectCard />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, defaultMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly on project page', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, defaultMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly without participative step', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, withoutParticipativeStepMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly with themes and districts', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, withThemesAndDistrictsMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly without cover', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, withoutCoverMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly an external project', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, externalMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render correctly an archived project', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, archivedMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render a project with paper votes', () => {
      environment.mock.queueOperationResolver((operation: any) =>
        MockPayloadGenerator.generate(operation, paperVotesMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestProjectCard backgroundColor="#e5e5e5" isProjectsPage={false} />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
