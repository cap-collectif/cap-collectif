/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import MediaDeleteModal from './MediaDeleteModal'
import { addsSupportForPortals, clearSupportForPortals, MockProviders } from 'tests/testUtils'

describe('<MediaDeleteModal />', () => {
  let testComponentTree: any

  beforeEach(() => {
    addsSupportForPortals()
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('should render correctly', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <MediaDeleteModal onClose={jest.fn} medias={['m1', 'm2', 'm3']} totalCount={3} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
