/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import StepEvents from './StepEvents'
import type { StepEventsTestQuery } from '~relay/StepEventsTestQuery.graphql'

describe('<StepEvents />', () => {
  let environment: any
  let testComponentTree: any
  let TestStepEvents: any

  const query = graphql`
    query StepEventsTestQuery($id: ID = "<default>") @relay_test_operation {
      step: node(id: $id) {
        ...StepEvents_step
      }
    }
  `

  const defaultMockResolvers = {
    Node: () => ({
      id: '<default>',
      eventsWithoutFilters: {
        totalCount: 5,
      },
      eventsFuture: {
        totalCount: 3,
      },
      eventsPast: {
        totalCount: 2,
      },
      events: {
        totalCount: 3,
        edges: [
          {
            node: {
              id: 'event1',
              googleMapsAddress: {
                json: '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
              },
            },
          },
          {
            node: {
              id: 'event2',
              googleMapsAddress: {
                json: '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
              },
            },
          },
          {
            node: {
              id: 'event3',
              googleMapsAddress: {
                json: '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
              },
            },
          },
        ],
      },
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<StepEventsTestQuery>(query, variables)
      if (data) {
        return <StepEvents step={data.step} {...componentProps} />
      }
      return null
    }

    TestStepEvents = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestStepEvents />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestStepEvents />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
