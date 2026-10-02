/* eslint-env jest */
import { render } from '@testing-library/react'
import MediaModal from './MediaModal'
import { addsSupportForPortals, clearSupportForPortals, MockProviders } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<MediaModal />', () => {
  beforeEach(() => {
    addsSupportForPortals()
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('should render correctly', () => {
    const { asFragment } = render(
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
    expect(asFragment()).toMatchSnapshot()
  })
})
