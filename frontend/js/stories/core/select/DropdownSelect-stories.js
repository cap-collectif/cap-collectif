// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import DropdownSelect from '~ui/DropdownSelect';

storiesOf('Core|Select/DropdownSelect', module)
  .add('default', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 4</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 5</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item3">Item 6</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with submenus on root', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Menu name="Etape 1">
          <DropdownSelect.Choice value="itemÉtape1.1">Item étape 1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.2">Item étape 1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 2">
          <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 3">
          <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 3">
          <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
      </DropdownSelect>
    );
  })
  .add('with submenu', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Menu name="Etape 1">
          <DropdownSelect.Choice value="itemÉtape1.1">Item étape 1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.2">Item étape 1.2</DropdownSelect.Choice>
          <DropdownSelect.Menu name="Etape 1 - 1">
            <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
            <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>
          </DropdownSelect.Menu>
        </DropdownSelect.Menu>
        <DropdownSelect.Menu name="Etape 2">
          <DropdownSelect.Choice value="itemÉtape2.1">Item étape 2.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape2.2">Item étape 2.2</DropdownSelect.Choice>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>
    );
  })
  .add('with submenu dancing left and right', () => {
    return (
      <DropdownSelect title="Trier par">
        <DropdownSelect.Choice value="item1">Item 1</DropdownSelect.Choice>
        <DropdownSelect.Choice value="item2">Item 2</DropdownSelect.Choice>
        <DropdownSelect.Menu name="Étape dansante">
          <DropdownSelect.Choice value="itemÉtape1.1">Item étape 1.1</DropdownSelect.Choice>
          <DropdownSelect.Choice value="itemÉtape1.2">Item étape 1.2</DropdownSelect.Choice>
          <DropdownSelect.Menu name="Etape 1 - 1" pointing="left">
            <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
            <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>

            <DropdownSelect.Menu name="Etape 1 - 1" pointing="right">
              <DropdownSelect.Choice value="itemÉtape1.1.1">Item étape 1.1.1</DropdownSelect.Choice>
              <DropdownSelect.Choice value="itemÉtape1.1.2">Item étape 1.1.2</DropdownSelect.Choice>

              <DropdownSelect.Menu name="Etape 1 - 1" pointing="left">
                <DropdownSelect.Choice value="itemÉtape1.1.1">
                  Item étape 1.1.1
                </DropdownSelect.Choice>
                <DropdownSelect.Choice value="itemÉtape1.1.2">
                  Item étape 1.1.2
                </DropdownSelect.Choice>

                <DropdownSelect.Menu name="Etape 1 - 1" pointing="right">
                  <DropdownSelect.Choice value="itemÉtape1.1.1">
                    Item étape 1.1.1
                  </DropdownSelect.Choice>
                  <DropdownSelect.Choice value="itemÉtape1.1.2">
                    Item étape 1.1.2
                  </DropdownSelect.Choice>
                </DropdownSelect.Menu>
              </DropdownSelect.Menu>
            </DropdownSelect.Menu>
          </DropdownSelect.Menu>
        </DropdownSelect.Menu>
        <DropdownSelect.Choice value="item3">Item 3</DropdownSelect.Choice>
      </DropdownSelect>
    );
  });
