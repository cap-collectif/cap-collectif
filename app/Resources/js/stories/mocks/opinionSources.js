// @flow
import { author } from './users';

export const opinionSource = {
  url: 'https://ui.cap-collectif.com/',
  user: author,
  createdAt: ' • 1 mars 2016',
  publishedAt: ' • 1 mars 2016',
  title: 'Source title',
  category: 'Politique',
  body:
    'In placeat reiciendis ut. Officiis praesentium quia minima ut tenetur officiis. Eaque fugit voluptates temporibus suscipit provident culpa culpa. Magni recusandae dolorem aut id.',
  votes: { totalCount: 2 },
};

export const opinionSources = [
  { ...opinionSource },
  { ...opinionSource },
  { ...opinionSource, user: { ...opinionSource.user, vip: true } },
  { ...opinionSource },
  { ...opinionSource, category: null },
];
