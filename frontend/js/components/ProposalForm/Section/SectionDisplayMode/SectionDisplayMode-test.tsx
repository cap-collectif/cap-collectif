/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { SectionDisplayMode, LOCATION_PARIS } from './SectionDisplayMode'
import { $refType, $fragmentRefs, googleAddressMock } from '~/mocks'

const props = {
  formName: 'formName',
  dispatch: jest.fn(),
  latitude: LOCATION_PARIS.lat,
  longitude: LOCATION_PARIS.lng,
  errorViewEnabled: null,
  dataMap: googleAddressMock,
  proposalForm: {
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
    mapCenter: {
      lat: 47.47116,
      lng: -0.55182,
      json: '[{\\"formatted_address\\":\\"Angers, France\\",\\"geometry\\":{\\"bounds\\":{\\"south\\":47.4374,\\"west\\":-0.6177264,\\"north\\":47.526392,\\"east\\":-0.5081431},\\"location\\":{\\"lat\\":47.47116159999999,\\"lng\\":-0.5518257},\\"location_type\\":\\"APPROXIMATE\\",\\"viewport\\":{\\"south\\":47.4374,\\"west\\":-0.6177264,\\"north\\":47.526392,\\"east\\":-0.5081431}},\\"types\\":[\\"locality\\",\\"political\\"],\\"address_components\\":[{\\"long_name\\":\\"Angers\\",\\"short_name\\":\\"Angers\\",\\"types\\":[\\"locality\\",\\"political\\"]},{\\"long_name\\":\\"Maine-et-Loire\\",\\"short_name\\":\\"Maine-et-Loire\\",\\"types\\":[\\"administrative_area_level_2\\",\\"political\\"]},{\\"long_name\\":\\"Pays de la Loire\\",\\"short_name\\":\\"Pays de la Loire\\",\\"types\\":[\\"administrative_area_level_1\\",\\"political\\"]},{\\"long_name\\":\\"France\\",\\"short_name\\":\\"FR\\",\\"types\\":[\\"country\\",\\"political\\"]}],\\"place_id\\":\\"ChIJnY7lANp4CEgRMJwNHlI3DQQ\\"}]',
    },
    zoomMap: 20,
    step: {
      project: {
        firstCollectStep: {
          form: {
            isGridViewEnabled: true,
            isListViewEnabled: false,
            isMapViewEnabled: true,
          },
        },
        steps: [
          {
            __typename: 'CollectStep',
            mainView: 'GRID',
            form: {
              isGridViewEnabled: true,
              isListViewEnabled: false,
              isMapViewEnabled: true,
            },
          },
          {
            __typename: 'SelectionStep',
            mainView: 'MAP',
          },
        ],
      },
    },
  },
}
describe('<SectionDisplayMode />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SectionDisplayMode {...props} isMapViewEnabled />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when map view not enabled', () => {
    const wrapper = shallow(<SectionDisplayMode {...props} isMapViewEnabled={false} />)
    expect(wrapper).toMatchSnapshot()
  })
})
