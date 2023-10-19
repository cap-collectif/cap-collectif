/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { MapContainer } from 'react-leaflet'
import { LeafletMap } from './LeafletMap'
import { $fragmentRefs, $refType } from '~/mocks'

describe('<LeafletMap />', () => {
  const defaultMapOptions = {
    center: {
      lat: 48.8586047,
      lng: 2.3137325,
    },
    zoom: 12,
  }
  const query = {
    ' $refType': $refType,
    events: {
      edges: [
        {
          node: {
            id: 'event1',
            googleMapsAddress: {
              lat: 47.12345789,
              lng: 1.23456789,
            },
            ' $fragmentRefs': $fragmentRefs,
          },
        },
        {
          node: {
            id: 'event2',
            googleMapsAddress: {
              lat: 47.1235444789,
              lng: 1.23477789,
            },
            ' $fragmentRefs': $fragmentRefs,
          },
        },
      ],
    },
  }
  it('should render a map with markers', () => {
    const wrapper = shallow(
      <MapContainer>
        <LeafletMap defaultMapOptions={defaultMapOptions} loading={false} query={query} />,
      </MapContainer>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
