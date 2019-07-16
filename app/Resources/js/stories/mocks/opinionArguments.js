// @flow
import { author } from './users';

export const opinionArgument = {
  id: 1,
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
  { ...opinionArgument, id: 1 },
  { ...opinionArgument, id: 2, user: { ...opinionArgument.user, vip: true } },
  { ...opinionArgument, id: 3, user: null },
  { ...opinionArgument, id: 4, trashedStatus: 'INVISIBLE', body: null },
  { ...opinionArgument, id: 5, published: false },
  { ...opinionArgument, id: 6, viewerHasVote: true },
  { ...opinionArgument, id: 7, contribuable: false },
  { ...opinionArgument, id: 8, viewerHasVote: true, contribuable: false },
  { ...opinionArgument, id: 9, user: { ...opinionArgument.user, isViewer: true } },
  { ...opinionArgument, id: 10, reported: true },
];
