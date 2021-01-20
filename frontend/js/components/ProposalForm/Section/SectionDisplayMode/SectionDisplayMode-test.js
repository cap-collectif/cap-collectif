// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SectionDisplayMode, LOCATION_PARIS } from './SectionDisplayMode';
import { $refType, $fragmentRefs, googleAddressMock } from '~/mocks';

const props = {
  formName: 'formName',
  dispatch: jest.fn(),
  latitude: LOCATION_PARIS.lat,
  longitude: LOCATION_PARIS.lng,
  errorViewEnabled: null,
  dataMap: googleAddressMock,
  proposalForm: {
    $fragmentRefs,
    $refType,
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
            mainView: 'grid',
            form: {
              isGridViewEnabled: true,
              isListViewEnabled: false,
              isMapViewEnabled: true,
            },
          },
          {
            __typename: 'SelectionStep',
            mainView: 'map',
          },
        ],
      },
    },
  },
};

describe('<SectionDisplayMode />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SectionDisplayMode {...props} isMapViewEnabled />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when map view not enabled', () => {
    const wrapper = shallow(<SectionDisplayMode {...props} isMapViewEnabled={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
