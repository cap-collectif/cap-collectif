// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from 'storybook-addon-knobs';
import DebateCard from '~/components/InteClient/DebateCard/DebateCard';

storiesOf('Inté client/DebateCard', module)
  .add(
    'Default',
    () => (
      <div style={{ maxWidth: 1000, margin: 'auto' }}>
        <DebateCard
          type="AGAINST"
          title={text('title', "Le cannabis c'est le mal")}
          body={text(
            'body',
            'La loi de 1970, qui a rendu illicite le cannabis, reste pertinente, avec la confirmation de la nocivité de cette drogue. La France est, pour sa consommation, au premier rang des 27 états Européens, avec 1 600 000 usagers réguliers et 600 000 usagers quotidiens ou multi-quotidiens.',
          )}
          username={text('username', 'Agui le bg')}
          avatarUrl={text('avatarUrl', 'https://picsum.photos/50')}
          biography={text('biography', 'Expert sur le cannabis (lol)')}
        />
      </div>
    ),
    {
      knobsToBo: {
        componentName: 'DebateCardApp',
      },
    },
  )
  .add('Both Cards', () => (
    <div>
      <div
        style={{
          maxWidth: 1000,
          margin: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <DebateCard
          type="AGAINST"
          title="Le cannabis c'est le mal"
          body="La loi de 1970, qui a rendu illicite le cannabis, reste pertinente, avec la confirmation de la nocivité de cette drogue. La France est, pour sa consommation, au premier rang des 27 états Européens, avec 1 600 000 usagers réguliers et 600 000 usagers quotidiens ou multi-quotidiens."
          username="Agui le bg"
          avatarUrl="https://picsum.photos/50"
          biography="Expert sur le cannabis (lol)"
          mr={4}
        />
        <DebateCard
          type="FOR"
          title="Le cannabis c'est cool"
          body="Old pirates, yes they rob I Sold I to the merchant ships But minutes after they took I To the bottomless pit But my hand were made strong By the hands of the almighty We forward in this generation Triumphantly"
          username="Bob Marley"
          avatarUrl="https://picsum.photos/50"
          biography="Expert sur le cannabis de vrai"
        />
      </div>
    </div>
  ));
