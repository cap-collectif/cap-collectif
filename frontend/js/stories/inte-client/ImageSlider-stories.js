// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject, object } from 'storybook-addon-knobs';
import ImageSlider from '~/components/InteClient/ImageSlider/ImageSlider';

const inputs = [
  {
    url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/0/0f/Le_Figaro_%28ancien_logo%29.svg/1280px-Le_Figaro_%28ancien_logo%29.svg.png',
    alt: 'logo 1',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Lemonde_fr_2005_logo.svg/1280px-Lemonde_fr_2005_logo.svg.png',
    alt: 'logo 1',
    link: 'https://toto.fr',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lib%C3%A9ration.svg/1280px-Lib%C3%A9ration.svg.png',
    alt: 'logo 1',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/d/dc/L%27Express_-_2016.svg/2863px-L%27Express_-_2016.svg.png',
    alt: 'logo 1',
  },
  {
    url: 'https://www.wedemain.fr/photo/iphone_titre_21642575.png?v=1574258370',
    alt: 'logo 1',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/0/0f/Le_Figaro_%28ancien_logo%29.svg/1280px-Le_Figaro_%28ancien_logo%29.svg.png',
    alt: 'logo 1',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/0/0f/Le_Figaro_%28ancien_logo%29.svg/1280px-Le_Figaro_%28ancien_logo%29.svg.png',
    alt: 'logo 1',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/0/0f/Le_Figaro_%28ancien_logo%29.svg/1280px-Le_Figaro_%28ancien_logo%29.svg.png',
    alt: 'logo 1',
  },
  {
    url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/0/0f/Le_Figaro_%28ancien_logo%29.svg/1280px-Le_Figaro_%28ancien_logo%29.svg.png',
    alt: 'logo 1',
  },
];

const settingsSlider = object('settingsSlider', {
  dots: true,
  infinite: true,
  speed: 400,
  slidesToShow: 6,
  slidesToScroll: 3,
  arrows: false,
  autoplay: false,
  centerPadding: '60px',
});

storiesOf('Inté client/ImageSlider', module).add(
  'Default',
  () => <ImageSlider images={arrayObject('images', inputs)} settingsSlider={settingsSlider} />,
  {
    knobsToBo: {
      componentName: 'ImageSliderApp',
    },
  },
);
