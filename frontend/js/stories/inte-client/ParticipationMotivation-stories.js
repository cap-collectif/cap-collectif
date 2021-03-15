// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject, text } from 'storybook-addon-knobs';
import ParticipationMotivation from '~/components/InteClient/ParticipationMotivation/ParticipationMotivation';

const inputs = [
  '<span>Les 50 contributions les plus soutenues</span> obtiendront une <span>réponse argumentée</span> des députés',
  '<span>Des contributeurs seront invités à débattre</span> avec les députés lors de la journée délibérative',
  'Les 10 propositions les plus soutenues et les propositions jugées pertinentes seront <span>déposées sous la forme d’amendements</span> lors de la lecture du texte en Commission',
  'La proposition de loi co-construite avec vous sera <span>déposée à l’ordre du jour de l’Assemblée nationale</span> en février 2021',
];

storiesOf('Inté client/ParticipationMotivation', module).add(
  'Default',
  () => (
    <ParticipationMotivation
      motivations={arrayObject('motivations', inputs)}
      color={text('color', '#4211D0')}
    />
  ),
  {
    knobsToBo: {
      componentName: 'ParticipationMotivationApp',
    },
  },
);
