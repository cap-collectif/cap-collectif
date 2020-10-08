// @flow
import { author } from './users';

export const post = {
  title: 'Je suis le titre',
  url: '#',
  image: {
    src: 'https://source.unsplash.com/random/150x100',
    alt: 'news picture',
  },
  body:
    ' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',

  date: {
    released: '2019-11-09',
  },
  theme: 'Test & Democratie',

  user: author,
};

export const withoutParaph = {
  title: 'un titre pour le deuxième cas',
  url: '#',
  image: {
    src: 'https://source.unsplash.com/random/150x100',
    alt: 'visual for other case',
  },
  date: { released: '19/12/2019' },
  theme: 'Test et Jest',
  user: author,
  body: '',
};
export default post;
