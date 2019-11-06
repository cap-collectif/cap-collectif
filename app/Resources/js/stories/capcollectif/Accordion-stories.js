// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, arrayObject, color } from '@storybook/addon-knobs';
import Accordion from '../../components/Ui/Accordion/Accordion';

storiesOf('Cap Collectif|Accordion', module).add(
  '3 inputs',
  () => {
    const inputs = [
      {
        key: '0',
        title: 'Consulter les réponses du haut-commissaire pour la semaine du 3 au 11 octobre',
        content: 'Blablabla réponses',
      },
      {
        key: '1',
        title: 'Consulter les réponses du haut-commissaire pour la semaine du 12 au 18 octobre',
        content:
          `<div style='display: flex; justify-content: space-between;'>` +
          `<div style='max-width: 450px;'><ul>` +
          `<li>Question <a href='#'>Il faut un simulateur</a> </li>` +
          `<li>Question <a href='#'>Pourquoi la réforme des retraites ` +
          `n'impacte pas les élus et haut-fonctionnaires qui continuent à jouir ` +
          `de privilèges qu'aucun citoyen n'a ?</a> </li>` +
          `<li>Question <a href='#'>Situation des fonctionnaires et maintien ` +
          `du mode de calcul de leur retraite</a> </li>` +
          `<li>Question <a href='#'>Carrières longues</a> </li>` +
          `<li>Question <a href='#'>Retraite des élus</a> </li>` +
          `</ul></div>` +
          `<div style='text-align: center;'><img src='https://source.unsplash.com/random/300x200'/><p>Réponse de Jean Paul Delevoye, haut-comissaire aux Retraites</p></div>` +
          `</div>`,
      },
      {
        key: '2',
        title: 'Consulter les réponses du haut-commissaire pour la semaine du 19 au 25 octobre',
        content: 'Blablabla réponses',
      },
    ];
    return (
      <div style={{ maxWidth: 1000, margin: 'auto' }}>
        <Accordion
          inputs={arrayObject('inputs', inputs)}
          defaultActiveKey={text('defaultActiveKey', '1')}
          openedColor={color('openedColor', '#CB3F71')}
          closedColor={color('closedColor', '#E8A8BF')}
          titleColor={color('titleColor', '#FFF')}
        />
      </div>
    );
  },
  {
    myKnob: {
      componentName: 'AccordionApp',
    },
  },
);
