// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventMap } from './EventMap';
import { $refType, relayPaginationMock } from '../../../mocks';

describe('<EventMap />', () => {
  it('renders correcty', () => {
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
              lat: 47.12345789,
              lng: 1.23456789,
              url: 'http://perdu.com',
              fullAddress: 'Ici et ailleur',
              startAt: '2018-09-27T03:00:00+01:00',
              endAt: '2019-09-27T03:00:00+01:00',
              title: 'Evenement des gens perdu',
              author: {
                username: 'toto',
                media: {
                  url: 'http://monimage.toto',
                },
                url: 'http://jesuistoto.fr',
              },
            },
          },
          {
            node: {
              id: 'event2',
              lat: 47.1235444789,
              lng: 1.23477789,
              url: 'http://perdu.com',
              fullAddress: 'Nul part et ailleur',
              startAt: '2018-10-07T03:00:00+01:00',
              endAt: '2019-10-27T03:00:00+01:00',
              title: 'Evenement des gens pas perdu',
              author: {
                username: 'toto',
                media: {
                  url: 'http://monimage.toto',
                },
                url: 'http://jesuistoto.fr',
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
