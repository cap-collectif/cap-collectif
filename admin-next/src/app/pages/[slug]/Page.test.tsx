/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { MockProviders } from 'tests/testUtils'
import PageRender from './PageRender'

describe('<PageRender />', () => {
  let testComponentTree

  it('renders correctly', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <PageRender title="My custom page" body="Lorem ipsum" />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
