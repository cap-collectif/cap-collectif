// @flow
import { author } from './users';

export const opinionArgument = {
  user: author,
  trashedStatus: '',
  createdAt: '1 mars 2016 à 00:00',
  publishedAt: '1 mars 2016 à 00:00',
  published: true,
  related: {
    url: 'https://ui.cap-collectif.com/',
    title: 'Opinion XXX',
  },
  body:
    'In placeat reiciendis ut. Officiis praesentium quia minima ut tenetur officiis. Eaque fugit voluptates temporibus suscipit provident culpa culpa. Magni recusandae dolorem aut id.',
  votes: { totalCount: 50 },
  viewerHasVote: false,
  contribuable: true,
  reported: false,
};

export const opinionArguments = [
  { ...opinionArgument },
  { ...opinionArgument, user: { ...opinionArgument.user, vip: true } },
  { ...opinionArgument, user: null },
  { ...opinionArgument, trashedStatus: 'INVISIBLE', body: null },
  { ...opinionArgument, published: false },
  { ...opinionArgument, viewerHasVote: true },
  { ...opinionArgument, contribuable: false },
  { ...opinionArgument, viewerHasVote: true, contribuable: false },
  { ...opinionArgument, user: { ...opinionArgument.user, isViewer: true } },
  { ...opinionArgument, reported: true },
];
