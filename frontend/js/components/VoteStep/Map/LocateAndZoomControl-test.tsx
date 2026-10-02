/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { MapContainer } from 'react-leaflet'
import LocateAndZoomControl from './LocateAndZoomControl'
import MockProviders from '~/testUtils'

/**
 * @jest-status legacy
 * @jest-reason Uses react-test-renderer or the historical Relay renderer instead of observing public DOM
 * behavior.
 */
describe('<LocateAndZoomControl />', () => {
  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders useCapUIProvider>
        <MapContainer>
          <LocateAndZoomControl />
        </MapContainer>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
