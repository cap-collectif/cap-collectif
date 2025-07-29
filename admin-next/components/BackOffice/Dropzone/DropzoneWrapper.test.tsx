/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import DropzoneWrapper from './DropzoneWrapper'
import { MockProviders } from 'tests/testUtils'

describe('<DropzoneWrapper />', () => {
  let testComponentTree: any

  it('should render correctly', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <DropzoneWrapper>content</DropzoneWrapper>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
