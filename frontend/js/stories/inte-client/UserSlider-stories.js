// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject, text, object } from 'storybook-addon-knobs';
import UserSlide from '~/components/InteClient/UserSlider/UserSlide/UserSlide';
import UserSlider from '~/components/InteClient/UserSlider/UserSlider';

const inputs = [
  {
    name: 'User 1',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img:
      'https://nextgen.cap-collectif.com/media/default/0001/01/6cacda6bd432b04bb34e3fe9a3a0717484378633.jpeg',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 2',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/500x500',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 3',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 4',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 5',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 6',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 7',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 8',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 9',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'User 10',
    job: { fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
  {
    name: 'Vincent NextGen',
    job: { fr: 'Développeur', en: 'Développeur' },
    img: 'https://source.unsplash.com/random/800x800',
    colors: { name: '#40408E' },
  },
];

const settingsSlider = object('settings slider', {
  dots: true,
  infinite: true,
  speed: 400,
  slidesToShow: 10,
  slidesToScroll: 1,
  arrows: false,
  autoplay: false,
  variableWidth: false,
});

storiesOf('Inté client|UserSlider/List', module).add(
  'Default',
  () => (
    <UserSlider
      users={arrayObject('users', inputs)}
      lang={text('lang', 'fr')}
      settingsSlider={settingsSlider}
    />
  ),
  {
    knobsToBo: {
      componentName: 'UserSliderApp',
    },
  },
);

storiesOf('Inté client|UserSlider/Item', module).add('Default', () => (
  <UserSlide
    name="Jean-Dominique Sénard"
    job={{ fr: 'PDG/CEO - Renault-Nissan', en: 'Yes' }}
    img="https://source.unsplash.com/random/800x800"
    colors={{ name: '#40408E' }}
    lang={text('lang', 'fr')}
  />
));
