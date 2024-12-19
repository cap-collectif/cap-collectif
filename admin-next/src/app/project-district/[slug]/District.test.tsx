/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from 'tests/testUtils'
import District from './District'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

jest.mock('@shared/hooks/useFeatureFlag')

describe('<District />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const districtResolver = {
    GlobalDistrict: () => ({
      id: 'district-id-1',
      name: 'Nice District',
      titleOnMap: 'ND',
    }),
  }
  const queryResolver = {
    Query: () => ({
      projects: { totalCount: 1, edges: [{ node: { id: 'project-id-1', title: 'Nice project' } }] },
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, districtResolver))
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, queryResolver))

    TestComponent = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <District slug="nice-district" />
      </RelaySuspensFragmentTest>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('renders correctly', () => {
    // @ts-ignore jest
    useFeatureFlag.mockImplementation(() => false)
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
