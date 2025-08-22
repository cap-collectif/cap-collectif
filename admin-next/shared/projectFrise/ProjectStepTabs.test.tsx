/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProjectStepTabs from './ProjectStepTabs'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { ProjectStepTabsTestQuery } from '@relay/ProjectStepTabsTestQuery.graphql'

describe('<ProjectStepTabs />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    Project: () => ({
      steps: [
        {
          id: 'pstepProjectWithOwner',
          state: 'CLOSED',
          label: 'Présentation',
          __typename: 'PresentationStep',
          url: 'https://capco.dev/consultation/projet-avec-administrateur-de-projet/presentation/presentation-project-with-owner',
          enabled: true,
          timeRange: {
            startAt: null,
            endAt: null,
          },
        },
        {
          id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcFByb2plY3RPd25lcg==',
          state: 'CLOSED',
          label: 'Consultation',
          __typename: 'ConsultationStep',
          url: 'https://capco.dev/project/projet-avec-administrateur-de-projet/consultation/etape-de-consultation-dans-un-projet-avec-administrateur-de-projet',
          enabled: true,
          timeRange: {
            startAt: '2020-11-03 20:30:55',
            endAt: '2032-11-03 06:45:12',
          },
        },
        {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBQcm9qZWN0V2l0aE93bmVy',
          state: 'OPENED',
          label: 'Dépôt',
          __typename: 'CollectStep',
          url: 'https://capco.dev/project/projet-avec-administrateur-de-projet/collect/budget-participatif-du-projet-avec-administrateur-de-projet',
          enabled: true,
          timeRange: {
            startAt: '2020-10-16 00:00:00',
            endAt: '2021-10-16 00:00:00',
          },
        },
        {
          id: 'questionnaireStepProjectWithOwner',
          state: 'FUTURE',
          label: 'Questionnaire qui dénonce',
          __typename: 'QuestionnaireStep',
          url: 'https://capco.dev/project/projet-avec-administrateur-de-projet/questionnaire/questionnaire-administrateur-de-projet',
          enabled: true,
          timeRange: {
            startAt: '2020-09-11 00:00:00',
            endAt: '2060-09-27 00:00:00',
          },
        },
      ],
      projectId: '5',
    }),
  }
  const query = graphql`
    query ProjectStepTabsTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectStepTabs_project
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProjectStepTabsTestQuery>(query, {})
      if (!data.project) return null
      return <ProjectStepTabs mainColor="#546E7A" project={data.project} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest useCapUIProvider environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render correctly without arrow & with active tab', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render null when there is only one step', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({
          steps: [
            {
              id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcFByb2plY3RPd25lcg==',
              state: 'OPENED',
              label: 'Consultation',
              __typename: 'ConsultationStep',
              url: 'https://capco.dev/project/projet-avec-administrateur-de-projet/consultation/etape-de-consultation-dans-un-projet-avec-administrateur-de-projet',
              enabled: true,
              timeRange: {
                startAt: '2020-11-03 20:30:55',
                endAt: '2032-11-03 06:45:12',
              },
            },
          ],
          projectId: '5',
        }),
      }),
    )
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
})
