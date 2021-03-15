// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Collapsable from '~ui/Collapsable';
import DropdownSelect from '~ui/DropdownSelect';

storiesOf('Core/Collapsable', module)
  .add('default', () => {
    return (
      <Collapsable>
        <Collapsable.Button>
          <p>Tri</p>
        </Collapsable.Button>
        <Collapsable.Element ariaLabel="Trier par">
          <DropdownSelect title="Trier par">
            <DropdownSelect.Choice value="newest">Plus récent</DropdownSelect.Choice>
            <DropdownSelect.Choice value="oldest">Plus ancien</DropdownSelect.Choice>
          </DropdownSelect>
        </Collapsable.Element>
      </Collapsable>
    );
  })
  .add('disabled', () => {
    return (
      <Collapsable disabled>
        <Collapsable.Button>
          <p>Tri</p>
        </Collapsable.Button>
        <Collapsable.Element ariaLabel="Trier par">
          <DropdownSelect title="Trier par">
            <DropdownSelect.Choice value="newest">Plus récent</DropdownSelect.Choice>
            <DropdownSelect.Choice value="oldest">Plus ancien</DropdownSelect.Choice>
          </DropdownSelect>
        </Collapsable.Element>
      </Collapsable>
    );
  });
