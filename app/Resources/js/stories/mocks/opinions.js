// @flow
import { author } from './users';

export const opinion = {
  id: 'opinion1',
  url: 'https://ui.cap-collectif.com/',
  title: 'Opinion',
  user: author,
  trashedStatus: '',
  createdAt: '1 mars 2018',
  publishedAt: '1 mars 2018',
  published: true,
  pinned: false,
  votes: { totalCount: 8 },
  versions: { totalCount: 3 },
  arguments: { totalCount: 4 },
  sources: { totalCount: 0 },
  votesMitige: { totalCount: 1 },
  votesNok: { totalCount: 3 },
  votesOk: { totalCount: 4 },
  // $FlowFixMe
  previewVotes: new Array(8).fill(author),
  body:
    'Lorem ipsum dolor amet direct trade cornhole exercitation hashtag mixtape, master cleanse vexillologist. Irure kickstarter single-origin coffee fashion axe vexillologist viral. Selfies etsy cloud bread heirloom, sunt craft beer fixie palo santo asymmetrical.',
  project: {
    opinionCanBeFollowed: true,
  },
  section: {
    voteWidgetType: 2,
  },
  appendices: [],
  answer: null,
};

export const opinions = [
  { ...opinion },
  { ...opinion, user: { ...opinion.user, vip: true } },
  { ...opinion, user: null },
  { ...opinion, votes: { totalCount: 0 } },
  { ...opinion, updatedAt: '15 mars 2018' },
  { ...opinion, updatedAt: '15 mars 2018', pinned: true },
  { ...opinion, updatedAt: '15 mars 2018', ranking: 'Label' },
  { ...opinion, updatedAt: '15 mars 2018', pinned: true, ranking: 'Label' },
  { ...opinion, ranking: 'Label' },
  { ...opinion, trashedStatus: 'INVISIBLE' },
  { ...opinion, pinned: true, ranking: 'Label' },
  { ...opinion, pinned: true },
  { ...opinion, published: false },
];
