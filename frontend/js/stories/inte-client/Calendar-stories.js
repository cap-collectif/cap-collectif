// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { arrayObject, text, number, boolean } from 'storybook-addon-knobs';
import Calendar from '~/components/InteClient/Calendar/Calendar';

const inputs = [
  {
    title: 'Lancement de la concertation',
    date: 'Jeudi 6 février',
  },
  {
    title: 'Première revue des participations et identification des tendances',
    date: 'Mars 2020',
  },
  {
    title: 'Fin des contributions sur le terrain et sur la plateforme',
    date: 'Avril 2020',
  },
  {
    title: 'Restitution de la concertation',
    date: 'Juin 2020',
  },
];

storiesOf('Inté client|Calendar', module)
  .add(
    'Default',
    () => (
      <div style={{ maxWidth: 1000, margin: 'auto' }}>
        <Calendar
          defaultColor={text('defaultColor', '#1C671C')}
          backgroundColor={text('backgroundColor', '#FFF')}
          inputs={arrayObject('inputs', inputs)}
        />
      </div>
    ),
    {
      knobsToBo: {
        componentName: 'CalendarApp',
      },
    },
  )
  .add(
    'With Styled Border',
    () => (
      <div style={{ maxWidth: 1000, margin: 'auto' }}>
        <Calendar
          withBorder={boolean('withBorder', true)}
          defaultColor={text('defaultColor', '#EE6132')}
          backgroundColor={text('backgroundColor', '#FFF')}
          inputs={arrayObject('inputs', inputs)}
        />
      </div>
    ),
    {
      knobsToBo: {
        componentName: 'CalendarApp',
      },
    },
  )
  .add(
    'With Active Color',
    () => (
      <div style={{ maxWidth: 1000, margin: 'auto', background: '#F3F3F3', padding: '20px' }}>
        <Calendar
          defaultColor={text('defaultColor', '#1E336E')}
          activeColor={text('activeColor', '#FA0183')}
          activeNumber={number('activeNumber', 1)}
          backgroundColor={text('backgroundColor', '#F3F3F3')}
          withBorder={boolean('withBorder', false)}
          inputs={arrayObject('inputs', inputs)}
        />
      </div>
    ),
    {
      knobsToBo: {
        componentName: 'CalendarApp',
      },
    },
  );
