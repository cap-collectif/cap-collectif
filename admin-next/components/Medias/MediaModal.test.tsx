/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import MediaModal from './MediaModal'
import { addsSupportForPortals, clearSupportForPortals, MockProviders } from 'tests/testUtils'

describe('<MediaModal />', () => {
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
        <MediaModal
          onClose={jest.fn}
          onDelete={jest.fn}
          media={{
            createdAt: '29-09-2024',
            height: 200,
            id: '54835395594',
            name: 'Maison.png',
            providerReference: 'maison.png',
            size: '1000000',
            url: '/media/33232332.png',
            width: 200,
          }}
        />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
