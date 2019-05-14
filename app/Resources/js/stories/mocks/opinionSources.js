// @flow
import { author } from './users';

export const opinionSource = {
  url: 'https://ui.cap-collectif.com/',
  trashedStatus: '',
  user: author,
  createdAt: ' • 1 mars 2016',
  publishedAt: ' • 1 mars 2016',
  title: 'Source title',
  category: 'Politique',
  body:
    'In placeat reiciendis ut. Officiis praesentium quia minima ut tenetur officiis. Eaque fugit voluptates temporibus suscipit provident culpa culpa. Magni recusandae dolorem aut id.',
  votes: { totalCount: 2 },
  viewerHasVote: false,
  contribuable: true,
  reported: false,
};

export const opinionSources = [
  { ...opinionSource },
  { ...opinionSource, user: { ...opinionSource.user, vip: true } },
  { ...opinionSource, category: null },
  { ...opinionSource, trashedStatus: 'INVISIBLE' },
  { ...opinionSource, viewerHasVote: true },
  { ...opinionSource, contribuable: false },
  { ...opinionSource, viewerHasVote: true, contribuable: false },
  { ...opinionSource, user: { ...opinionSource.user, isViewer: true } },
  { ...opinionSource, reported: true },
];
