// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventForm } from './EventForm';
import { intlMock, formMock, $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

const defaultProps = {
  intl: intlMock,
  ...formMock,
  features,
  dispatch: jest.fn(),
  onSubmit: jest.fn(),
  validate: jest.fn(),
  isAdmin: true,
  autoload: true,
  multi: true,
  initialValues: {},
  isSuperAdmin: false,
  query: {
    $fragmentRefs,
    $refType
  }
};

const eventNotComplete = {
  event: {
    id: 'event1',
    timeRange: {
      startAt: '2019-04-21',
      endAt: '',
    },
    title: 'my event',
    googleMapsAddress: null,
    metaDescription: '',
    customCode: '',
    enabled: true,
    body: '<p>My body</p>',
    commentable: true,
    guestListEnabled: true,
    themes: [],
    projects: [],
    media: {
      id: 'media1',
      url: 'http://capco.dev',
    },
    fullAddress: '',
    lat: null,
    lng: null,
    author: {
      id: 'user1',
      displayName: 'my name is toto',
    },
    $refType,
  },
};

const eventComplete = {
  event: {
    ...eventNotComplete.event,
    timeRange: {
      startAt: '2019-04-21',
      endAt: '2019-09-09',
    },
    googleMapsAddress: {
      json:
        '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
      formatted: '111 Avenue Jean Jaurès, 69007 Lyon, France',
      lat: 45.742842,
      lng: 4.84068000000002,
    },
    lat: 45.749842,
    lng: 4.94068000000002,
    metaDescription: 'meta description',
    customCode: 'custom code',
    themes: [{ id: '1', title: 'theme-1' }],
    projects: [{ id: '1', title: 'project-1' }],
  },
};

const initialValuesComplete = {
  ...defaultProps,
  initialValues: {
    id: 'event1',
    title: 'my super event',
    startAt: '2019-05-05',
    endAt: '2019-05-31',
    body: 'my body',
    enabled: false,
    commentable: false,
    guestListEnabled: true,
    metaDescription: 'meta description',
    customCode: 'custom code',
    media: {
      id: 'media1',
      url: 'http://capco.dev',
    },
    themes: [{ id: '1', title: 'theme-1' }],
    projects: [{ id: '1', title: 'project-1' }],
    author: { value: 'author1', label: 'author' },
    addressJson:
      '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
    addressText: '111 Avenue Jean Jaurès, 69007 Lyon, France',
  },
};

describe('<EventForm />', () => {
  it('it renders correctly without default props', () => {
    const props = {
      ...defaultProps,
      ...eventNotComplete,
    };
    const wrapper = shallow(<EventForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly with event complete', () => {
    const props = {
      ...defaultProps,
      ...eventComplete,
    };
    const wrapper = shallow(<EventForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly with initialValue', () => {
    const props = {
      ...initialValuesComplete,
      ...eventComplete,
    };
    const wrapper = shallow(<EventForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
