// @flow
import { author } from './users';

export const opinionVersion = {
  url: 'https://ui.cap-collectif.com/',
  title: 'Opinion version',
  user: author,
  createdAt: ' • 3 janvier 2015',
  pinned: true,
  publishedAt: ' • 3 janvier 2015',
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
  { ...opinionVersion, votes: { totalCount: 0 } },
];
