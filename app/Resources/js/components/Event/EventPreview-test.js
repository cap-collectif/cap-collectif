// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPreview } from './EventPreview';
import { $refType } from '../../mocks';

describe('<EventPreview />', () => {
  it('renders correctly and highlighted', () => {
    const props = {
      event: {
        $refType,
        id: 'event1',
        timeRange: {
          startAt: '2018-09-27T03:00:00+01:00',
          endAt: '2019-09-27T03:00:00+01:00',
        },
        title: 'Un super evenement',
        fullAddress: '21 rue george 5, 75012 Paris',
        url: 'http://impossible.com',
        themes: [
          {
            url: 'https://estcequecestbientotlheuredugouter.neocities.org/',
            title: "Le gouter c'est la vie",
          },
        ],
        author: {
          username: 'toto',
          media: {
            url: 'http://monimage.toto',
          },
          url: 'http://jesuistoto.fr',
        },
      },
      isHighlighted: true,
    };
    const wrapper = shallow(<EventPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly and not highlighted', () => {
    const props = {
      event: {
        $refType,
        id: 'event1',
        timeRange: {
          startAt: '2018-09-27T03:00:00+01:00',
          endAt: '2019-09-27T03:00:00+01:00',
        },
        title: 'Un super evenement',
        fullAddress: '21 rue george 5, 75012 Paris',
        url: 'http://impossible.com',
        themes: [
          {
            url: 'https://estcequecestbientotlheuredugouter.neocities.org/',
            title: "Le gouter c'est la vie",
          },
        ],
        author: {
          username: 'toto',
          media: {
            url: 'http://monimage.toto',
          },
          url: 'http://jesuistoto.fr',
        },
      },
      isHighlighted: false,
    };
    const wrapper = shallow(<EventPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without username', () => {
    const props = {
      event: {
        $refType,
        id: 'event1',
        timeRange: {
          startAt: '2018-09-27T03:00:00+01:00',
          endAt: '2019-09-27T03:00:00+01:00',
        },
        title: 'Un super evenement',
        fullAddress: '21 rue george 5, 75012 Paris',
        url: 'http://impossible.com',
        themes: [
          {
            url: 'https://estcequecestbientotlheuredugouter.neocities.org/',
            title: "Le gouter c'est la vie",
          },
        ],
        author: {
          username: '',
          media: {
            url: 'http://monimage.toto',
          },
          url: 'http://jesuistoto.fr',
        },
      },
      isHighlighted: false,
    };
    const wrapper = shallow(<EventPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without picture for user', () => {
    const props = {
      event: {
        $refType,
        id: 'event1',
        timeRange: {
          startAt: '2018-09-27T03:00:00+01:00',
          endAt: '2019-09-27T03:00:00+01:00',
        },
        title: 'Un super evenement',
        fullAddress: '21 rue george 5, 75012 Paris',
        url: 'http://impossible.com',
        themes: [
          {
            url: 'https://estcequecestbientotlheuredugouter.neocities.org/',
            title: "Le gouter c'est la vie",
          },
        ],
        author: {
          username: 'toto',
          url: 'http://jesuistoto.fr',
          media: null,
        },
      },
      isHighlighted: false,
    };
    const wrapper = shallow(<EventPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
