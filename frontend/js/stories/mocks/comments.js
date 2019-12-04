// @flow
import { author } from './users';

export const comment = {
  id: 'comment1',
  user: author,
  trashedStatus: '',
  createdAt: '1 mars 2018',
  publishedAt: '1 mars 2018',
  published: true,
  pinned: true,
  body:
    'Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical.',
  votes: { totalCount: 50 },
  viewerHasVote: false,
  contribuable: true,
  reported: false,
};

export const comments = [
  { ...comment, id: 'comment1-2' },
  { ...comment, id: 'comment1-3', highlighted: true },
  { ...comment, id: 'comment1-7', trashedStatus: 'INVISIBLE', body: null },
  { ...comment, id: 'comment1-4', pinned: false },
  { ...comment, id: 'comment1-5', pinned: false, published: false },
  { ...comment, id: 'comment1-6', user: { ...comment.user, isViewer: true } },
];
