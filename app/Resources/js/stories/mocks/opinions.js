// @flow
import { author } from './users';

export const opinion = {
  url: 'https://ui.cap-collectif.com/',
  title: 'Opinion',
  user: author,
  createdAt: ' • 1 mars 2018',
  pinned: true,
  publishedAt: ' • 1 mars 2018',
  votes: { totalCount: 4 },
  versions: { totalCount: 3 },
  arguments: { totalCount: 4 },
  sources: { totalCount: 0 },
  votesMitige: { totalCount: 1 },
  votesNok: { totalCount: 1 },
  votesOk: { totalCount: 2 },
};

export const opinions = [
  { ...opinion },
  { ...opinion, user: { ...opinion.user, vip: true } },
  { ...opinion, votes: { totalCount: 0 } },
];
