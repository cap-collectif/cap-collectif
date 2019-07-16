// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import Table from '../components/Ui/Table/Table';

storiesOf('Tables', module).add(
  'Table',
  () => {
    const tableLayoutFixed = boolean('TableLayoutFixed', false);
    const hover = boolean('Hover', true);
    const bordered = boolean('Bordered', false);

    return (
      <Table tableLayoutFixed={tableLayoutFixed} hover={hover} bordered={bordered}>
        <thead>
          <tr>
            <th>Titre de la proposition</th>
            <th>Référence</th>
            <th>Zone géographique</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ravalement de la façade</td>
            <td>1-7</td>
            <td>Maurepas Patton</td>
          </tr>
          <tr>
            <td>Plantation de tulipes</td>
            <td>1-4</td>
            <td>Nord Saint-Martin</td>
          </tr>
        </tbody>
      </Table>
    );
  },
  {
    info: {
      text: `
          Ce composant est utilisé ...
        `,
    },
  },
);
