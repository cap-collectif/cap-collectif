// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import EngagementItem from '~/components/InteClient/Engagement/EngagementItem/EngagementItem';
import EngagementList from '~/components/InteClient/Engagement/EngagementList/EngagementList';

const inputs = [
  {
    icon: 'https://image.flaticon.com/icons/png/512/114/114245.png',
    description: 'Main',
    linkText: 'Laver ses mains ?',
    link: 'https://www.dettol.fr/nos-conseils-hygiegravene/des-mains-propres/comment-devez-vous-vous-laver-les-mains/',
  },
  {
    icon: 'https://image.flaticon.com/icons/png/512/45/45898.png',
    description: 'Téléphone',
  },
  {
    icon: 'https://i.pinimg.com/originals/7d/04/1c/7d041c7af4c707962900e6ab49608932.png',
    description: 'Pop corn',
    linkText: 'Faire du pop corn',
    link: 'https://www.papillesetpupilles.fr/2012/01/recette-du-pop-corn.html/',
  },
];

storiesOf('Inté client/Engagement/List', module).add(
  'Default',
  () => <EngagementList engagements={inputs} style={{ maxWidth: 600, margin: 'auto' }} />,
  {
    knobsToBo: {
      componentName: 'EngagementApp',
    },
  },
);

storiesOf('Inté client/Engagement/Item', module).add('Default', () => (
  <EngagementItem
    icon="https://image.flaticon.com/icons/png/512/114/114245.png"
    description="Pomme"
  />
));
