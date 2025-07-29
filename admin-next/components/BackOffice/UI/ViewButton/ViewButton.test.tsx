/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import ViewButton from './ViewButton'
import { MockProviders } from 'tests/testUtils'
import { CapUIIcon } from '@cap-collectif/ui'

describe('<ViewButton />', () => {
  let testComponentTree: any

  it('should render correctly', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <ViewButton active onClick={jest.fn} icon={CapUIIcon.List}>
          List
        </ViewButton>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
