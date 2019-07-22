// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventMap } from './EventMap';
import { $refType, relayPaginationMock } from '../../../mocks';

describe('<EventMap />', () => {
  it('renders correctly', () => {
    const props = {
      relay: relayPaginationMock,
      query: {
        $refType,
        events: {
          totalCount: 5,
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'cursor1',
            endCursor: 'cursor2',
          },
          edges: [
            {
              node: {
                id: 'event1',
                googleMapsAddress: {
                  lat: 47.12345789,
                  lng: 1.23456789,
                },
              },
            },
            {
              node: {
                id: 'event2',
                googleMapsAddress: {
                  lat: 47.1235444789,
                  lng: 1.23477789,
                },
              },
            },
          ],
        },
      },
    };
    const wrapper = shallow(<EventMap {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
