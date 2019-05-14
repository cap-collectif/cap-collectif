// @flow
import { author } from './users';

export const argument = {
  user: author,
  trashedStatus: '',
  createdAt: '1 mars 2016 à 00:00',
  publishedAt: '1 mars 2016 à 00:00',
  body:
    'In placeat reiciendis ut. Officiis praesentium quia minima ut tenetur officiis. Eaque fugit voluptates temporibus suscipit provident culpa culpa. Magni recusandae dolorem aut id.',
  votes: { totalCount: 50 },
};

export const argumentsData = [
  { ...argument, user: { ...argument.user, vip: true } },
  { ...argument },
  { ...argument, trashedStatus: 'INVISIBLE' },
  { ...argument },
];
