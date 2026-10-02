/* eslint-env jest */
import { render } from '@testing-library/react'
import MediaDeleteModal from './MediaDeleteModal'
import { addsSupportForPortals, clearSupportForPortals, MockProviders } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<MediaDeleteModal />', () => {
  beforeEach(() => {
    addsSupportForPortals()
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('should render correctly', () => {
    const { asFragment } = render(
      <MockProviders>
        <MediaDeleteModal onClose={jest.fn} medias={['m1', 'm2', 'm3']} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
