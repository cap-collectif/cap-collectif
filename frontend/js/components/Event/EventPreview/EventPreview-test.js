/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventPreview } from './EventPreview';
import { $fragmentRefs, $refType } from '~/mocks';

const baseEvent = {
  $fragmentRefs,
  $refType,
  id: '1',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
  url: '#',
  timeRange: {
    startAt: '2030-03-10 00:00:00',
  },
  googleMapsAddress: {
    json:
      '[{"address_components":[{"long_name":"111","short_name":"111","types":["street_number"]},{"long_name":"Avenue Jean Jaurès","short_name":"Avenue Jean Jaurès","types":["route"]},{"long_name":"Lyon","short_name":"Lyon","types":["locality","political"]},{"long_name":"Rhône","short_name":"Rhône","types":["administrative_area_level_2","political"]},{"long_name":"Auvergne-Rhône-Alpes","short_name":"Auvergne-Rhône-Alpes","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"69007","short_name":"69007","types":["postal_code"]}],"formatted_address":"111 Avenue Jean Jaurès, 69007 Lyon, France","geometry":{"location":{"lat":45.742842,"lng":4.84068000000002},"location_type":"ROOFTOP","viewport":{"south":45.7414930197085,"west":4.839331019708538,"north":45.74419098029149,"east":4.842028980291502}},"place_id":"ChIJHyD85zjq9EcR8Yaae-eQdeQ","plus_code":{"compound_code":"PRVR+47 Lyon, France","global_code":"8FQ6PRVR+47"},"types":["street_address"]}]',
  },
  themes: [{ title: 'Immobilier' }],
  author: {
    $fragmentRefs,
  },
};

const event = {
  basic: {
    ...baseEvent,
  },
  withoutAddress: {
    ...baseEvent,
    googleMapsAddress: null,
  },
  withoutThemes: {
    ...baseEvent,
    themes: [],
  },
  withoutDate: {
    ...baseEvent,
    timeRange: {
      startAt: null,
    },
  },
};

describe('<EventPreview />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<EventPreview event={event.basic} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render  when illustration not displayed', () => {
    const wrapper = shallow(<EventPreview event={event.basic} hasIllustrationDisplayed={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no googleMapsAddress', () => {
    const wrapper = shallow(<EventPreview event={event.withoutAddress} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no themes', () => {
    const wrapper = shallow(<EventPreview event={event.withoutThemes} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when no date', () => {
    const wrapper = shallow(<EventPreview event={event.withoutDate} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });
});
