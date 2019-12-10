// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { ListGroupItem } from 'react-bootstrap';
import InputRequirement from '../../../components/Ui/Form/InputRequirement';
import ListGroup from '../../../components/Ui/List/ListGroup';
import CircleColor from '../../../components/Ui/CircleColor/CircleColor';
import { colors } from './CircleColor-stories';

storiesOf('Core|Form/InputRequirement', module)
  .add('default', () => (
    <form>
      <InputRequirement placeholder="Your text here" onChange={() => {}} onDelete={() => {}} />
    </form>
  ))
  .add(
    'in list',
    () => (
      <form>
        <ListGroup>
          <ListGroupItem>
            <CircleColor editable onChange={() => {}} defaultColor={colors[0]} colors={colors} />
            <InputRequirement
              initialValue="En cours d'analyse"
              onChange={() => {}}
              onDelete={() => {}}
            />
          </ListGroupItem>
          <ListGroupItem>
            <CircleColor editable onChange={() => {}} defaultColor={colors[2]} colors={colors} />
            <InputRequirement initialValue="Hors cadre" onChange={() => {}} onDelete={() => {}} />
          </ListGroupItem>
        </ListGroup>
      </form>
    ),
    {
      info: {
        text: `
            <p>Story un peu plus complète pour tester l'agencement de plusieurs compo UI dans une liste</p>
          `,
      },
    },
  )
  .add('long text to test overflow', () => (
    <form>
      <InputRequirement
        onChange={() => {}}
        onDelete={() => {}}
        initialValue="Et ça fait bim, bam, boum; Ça fait psht et ça fait vroum; Ça fait bim, bam, boum; Dans ma tête, y'a tout qui tourne; Ça fait shht et puis blabla; Ça fait comme ci, comme ça; Ça fait bim, bam, hahaha; Dans mon coeur, je comprends pas"
      />
    </form>
  ));
