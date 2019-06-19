// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalStepPageRendered } from './ProposalStepPage';
import { features } from '../../redux/modules/default';
import { $fragmentRefs } from '../../mocks';

describe('<ProposalStepPage />', () => {
  const props = {
    selectedViewByStep: 'map',
    count: 10,
    isAuthenticated: true,
    features: { ...features, display_map: true },
    step: {
      defaultSort: 'random',
      form: {
        latMap: 50.633333,
        lngMap: 3.066667,
        zoomMap: 10,
        districts: [
          {
            id: '1159891f-770c-11e9-990d-0242ac110007',
            displayedOnMap: true,
            geojson: '{invalidjson',
            border: null,
            background: null,
          },
        ],
      },
      id: 'U2VsZWN0aW9uU3RlcDoyNDRlYzlkOS03NzEyLTExZTktOTkwZC0wMjQyYWMxMTAwMDc=',
      kind: 'selection',
      statuses: [],
      private: false,
      voteType: 'BUDGET',
      $fragmentRefs,
    },
  };

  it('renders correctly with invalid GeoJson', () => {
    const wrapper = shallow(<ProposalStepPageRendered {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
