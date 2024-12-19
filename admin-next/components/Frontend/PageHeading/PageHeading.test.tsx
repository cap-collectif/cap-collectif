/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import PageHeading from './PageHeading'
import MockProviders from 'tests/testUtils'

describe('<PageHeading />', () => {
  it('renders correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <PageHeading title="Liste des projets" subtitle="Une belle liste" body="Lorem ipsum dolor...." />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
