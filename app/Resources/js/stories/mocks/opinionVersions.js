// @flow
import { author } from './users';

export const opinionVersion = {
  url: 'https://ui.cap-collectif.com/',
  title: 'Opinion version',
  user: author,
  createdAt: '3 janvier 2015',
  publishedAt: '3 janvier 2015',
  published: true,
  pinned: false,
  votes: { totalCount: 50 },
  arguments: { totalCount: 4 },
  sources: { totalCount: 0 },
  votesMitige: { totalCount: 1 },
  votesNok: { totalCount: 1 },
  votesOk: { totalCount: 2 },
};

export const opinionVersions = [
  { ...opinionVersion },
  { ...opinionVersion, user: { ...opinionVersion.user, vip: true } },
  { ...opinionVersion, pinned: true },
  { ...opinionVersion, ranking: 'Label' },
  { ...opinionVersion, pinned: true, ranking: 'Label' },
  { ...opinionVersion, updatedAt: '15 mars 2018' },
  { ...opinionVersion, updatedAt: '15 mars 2018', pinned: true },
  { ...opinionVersion, updatedAt: '15 mars 2018', ranking: 'Label' },
  { ...opinionVersion, updatedAt: '15 mars 2018', pinned: true, ranking: 'Label' },
  { ...opinionVersion, votes: { totalCount: 0 } },
  { ...opinionVersion, published: false },
  { ...opinionVersion, user: null },
];
