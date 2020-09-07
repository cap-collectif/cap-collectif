// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject } from 'storybook-addon-knobs';
import UserSlide from '~/components/InteClient/UserSlider/UserSlide/UserSlide';
import UserSlider from '~/components/InteClient/UserSlider/UserSlider';

const inputs = [
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Jean-Dominique Sénard',
    job: 'PDG/CEO - Renault-Nissan',
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
];

storiesOf('Inté client|UserSlider/List', module).add(
  'Default',
  () => <UserSlider users={arrayObject('users', inputs)} />,
  {
    knobsToBo: {
      componentName: 'UserSliderApp',
    },
  },
);

storiesOf('Inté client|UserSlider/Item', module).add('Default', () => (
  <UserSlide
    name="Jean-Dominique Sénard"
    job="PDG/CEO - Renault-Nissan"
    img="https://source.unsplash.com/random/800x800"
    colors={{ name: '#40408E' }}
  />
));
