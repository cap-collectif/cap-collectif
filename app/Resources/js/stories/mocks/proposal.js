// @flow
import { author } from './users';

export const proposal = {
  address: { lat: 48.8586047, lng: 2.3137325 },
  url: 'http://cap-collectif.com',
  title: 'Ma proposition',
  publishedAt: '2017-02-01 00:04:00',
  author: { ...author, displayName: 'User 1', url: 'ui.cap-collectif.com' },
  media: {
    url: 'https://picsum.photos/300/400',
    alt: 'proposal picture',
  },
};
